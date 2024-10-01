import {ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {LearnerCourseService} from "../../service/learner-course.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {VideoService} from "../../service/video.service";
import {MessageService} from "primeng/api";
import {LearnerLessons} from "../../../assets/models/learner_course.interface";
import {LearnerLesson} from "../../../assets/models/learner_lesson.interface";
import Plyr from "plyr";

@Component({
  selector: 'app-course-detail-non-auth',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    RouterLink,
    NgStyle
  ],
  templateUrl: './course-detail-non-auth.component.html',
  styleUrl: './course-detail-non-auth.component.css'
})
export class CourseDetailNonAuthComponent implements OnInit,OnDestroy {

  @ViewChild('plyrID', { static: true }) videoElement!: ElementRef;


  private learnerCourseService = inject(LearnerCourseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private videoService = inject(VideoService)
  private messageService = inject(MessageService);
  private cd =  inject(ChangeDetectorRef);

  videoUrl!: string;
  public lessonId!: number;
  public lessons: LearnerLessons[] = [];
  public lesson!: LearnerLesson;
  public courseName!: string;
  public lessonStatus!:string;
  public topicName!: string;
  public lessonName!: string;
  public teacherName!: string;
  public lessonIndex!: number;
  public lessonVideo!:string;
  public video!: string;
  public player!: Plyr;
  public progress: number = 0;
  public checkProgressInterval: any;
  firstVideoStartTimeSaved: boolean = false;
  nextLessonIsAvailable: boolean = false;
  autoSaveInterval!: any;
  prevVideoTime: number = 0;
  videoStartTime: number = 0;
  public testId!: number;
  public testStatus!: string;
  public lessonsAndTests: any[] = [];
  progressSegments: { filled: boolean }[] = [];

  getTemaStatusIcon(status: string): string {
    switch (status) {
      case 'passed':
        return 'assets/images/finished.svg';
      case 'passed-retake':
        return 'assets/images/passed-retake.svg';
      case 'opened':
        return 'assets/images/opened.svg';
      case 'expired':
        return 'assets/images/expired.svg';
      case 'opened_retake':
        return 'assets/images/expired.svg';
      case 'completed':
        return 'assets/images/completed.svg';
      default:
        return 'assets/images/closed.svg';
    }
  }

  ngOnInit() {
    this.cd.detectChanges();

    this.player = new Plyr(this.videoElement.nativeElement, { captions: { active: true } });
    this.player.on('timeupdate', this.saveVideoTimeUpdate.bind(this));
    this.player.on('ended', this.saveVideoFinish.bind(this));
    this.route.paramMap.subscribe(params => {
      const lessonIdParam = params.get('course_id');
      if (lessonIdParam) {
        this.lessonId = +lessonIdParam;
        this.getLesson(this.lessonId);
        this.loadLessonVideo();
      } else {
        console.error('Lesson ID is missing or invalid');
      }
    });
  }

  public getLesson(lessonId: number) {
    this.learnerCourseService.getLessonFree(lessonId).subscribe((data) => {
      console.log('Data received:', data);

      this.lesson = data;
      this.lessons = data.lessons;
      this.courseName = data.course_name;
      this.topicName = data.topic_name;
      this.lessonName = data.lesson_name;
      this.teacherName = data.teacher_fullname;
      this.lessonIndex = data.lesson_number;
      this.lessonStatus = data.lesson_status;
      this.lessonsAndTests = [...this.lessons];
      this.lessonVideo = data.video ? `http://127.0.0.1:8000${data.video}` : '';
      if (data.test) {
        this.lessonsAndTests.push({
          id: data.test.id,
          status: data.test.status,
          type: 'test'
        });
      }

      if (data.homework) {
        this.lessonsAndTests.push({
          id: data.homework.id,
          status: data.homework.status,
          type: 'homework'
        });
      }
      this.calculateProgress();

      this.cd.detectChanges();
    });
  }

  public getRouterLink(item: any) {
    if (item.status === 'passed' || item.status === 'opened') {
      if (item.type === 'test') {
        return ['/student/test', item.id];
      } else if (item.type === 'homework') {
        return ['/student/homework', item.id];
      } else {
        return ['/student/lesson', item.id];
      }
    }
    return null;
  }




  ngOnDestroy() {
    this.clearIntervals();
  }


  public calculateProgress() {
    const totalItems = this.lessonsAndTests.length;

    const passedItems = this.lessonsAndTests.filter(item => item.status === 'passed').length;

    if (totalItems > 0) {
      this.progress = (passedItems / totalItems) * 100;

      this.progressSegments = [];

      for (let i = 0; i < totalItems; i++) {
        this.progressSegments.push({
          filled: this.lessonsAndTests[i].status === 'passed'
        });
      }
    }
  }

  public back() {
    this.router.navigate([`/student/courses/${this.lesson.course_id}`]);
  }

  public nextLesson() {
    this.router.navigate([`/student/lesson/${this.lesson.next_lesson_id}`]).then(() => {
      this.clearIntervals();
    });
  }

  clearIntervals(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    if (this.checkProgressInterval) {
      clearInterval(this.checkProgressInterval);
      this.checkProgressInterval = null;
    }
  }


  saveVideoTimeUpdate(): void {
    if (!this.nextLessonIsAvailable) {
      const currentTime = this.player.currentTime;

      if (!this.firstVideoStartTimeSaved) {
        this.firstVideoStartTimeSaved = true;
        this.videoStartTime = currentTime;
        this.prevVideoTime = currentTime;
      }

      if (Math.abs(currentTime - this.prevVideoTime) > 2) {
        this.videoService.sendVideoTimeUpdate(this.videoStartTime, this.prevVideoTime,this.lessonId).subscribe(() => {
          console.log(`start = ${this.videoStartTime}, prev = ${this.prevVideoTime}`);
        });
        this.videoStartTime = currentTime;
        this.prevVideoTime = currentTime;
      } else {
        this.prevVideoTime = currentTime;
      }
    }
  }

  autoSaveVideoProgress(): void {
    const currentTime = this.player.currentTime;
    this.videoService.sendVideoTimeUpdate(this.videoStartTime, currentTime, this.lessonId).subscribe(() => {
      console.log(` start = ${this.videoStartTime},  = ${currentTime}`);
      this.videoStartTime = currentTime;
    });
  }


  saveVideoFinish(): void {
    if (!this.nextLessonIsAvailable) {
      this.videoService.sendVideoTimeUpdate(this.videoStartTime, this.prevVideoTime,this.lessonId).subscribe(() => {
        this.getLesson(this.lessonId);
        this.firstVideoStartTimeSaved = false;
        this.videoStartTime = 0;
        this.prevVideoTime = 0;
      });
    }
  }


  loadLessonVideo() {
    if (!this.lessonVideo) {
      console.error('Видео не доступно');
      return;
    }

    this.player.source = {
      type: 'video',
      sources: [
        {
          src: this.lessonVideo,
          type: 'video/mp4',
          size: 1080
        },
        {
          src: this.lessonVideo,
          type: 'video/mp4',
          size: 720
        },
        {
          src: this.lessonVideo,
          type: 'video/mp4',
          size: 480
        }
      ]
    };
  }

  changeQuality(quality: number) {
    let videoUrl: string = '';

    if (quality === 720) {
      videoUrl = this.videoService.getLessonVideoUrl(this.lessonId, 720);
    } else if (quality === 480) {
      videoUrl = this.videoService.getLessonVideoUrl(this.lessonId, 480);
    }

    if (videoUrl) {
      this.player.source = {
        type: 'video',
        sources: [
          {
            src: videoUrl,
            type: 'video/mp4',
            size: quality
          }
        ]
      };

      this.player.once('loadedmetadata', () => {
        this.player.play();
      });
    } else {
      console.error('Video URL is not defined for the selected quality.');
    }
  }







}

