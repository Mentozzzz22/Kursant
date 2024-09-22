import {Component, ElementRef, inject, input, OnInit, ViewChild} from '@angular/core';
import {ProgressBarModule} from "primeng/progressbar";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MenuItem} from "primeng/api";
import {LearnerCourseService} from "../../service/learner-course.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LearnerLessons} from "../../../assets/models/learner_course.interface";
import {LearnerLesson} from "../../../assets/models/learner_lesson.interface";

import Plyr from 'plyr';
import {VideoService} from "../../service/video.service";
@Component({
  selector: 'app-sabak-page',
  standalone: true,
  imports: [
    ProgressBarModule,
    BreadcrumbModule,
    NgClass,
    NgIf,
    NgForOf
  ],
  templateUrl: './sabak-page.component.html',
  styleUrl: './sabak-page.component.css'
})
export class SabakPageComponent implements OnInit {

  @ViewChild('plyrID', { static: true }) videoElement!: ElementRef;


  private learnerCourseService = inject(LearnerCourseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private videoService = inject(VideoService)

  videoUrl!: string;
  public lessonId!: number;
  public lessons: LearnerLessons[] = [];
  public lesson!: LearnerLesson;
  public courseName!: string;
  public topicName!: string;
  public lessonName!: string;
  public teacherName!: string;
  public lessonIndex!: number;
  public video!: string;
  public player!: Plyr;
  public progress: number = 0;
  public checkProgressInterval: any;
  firstVideoStartTimeSaved: boolean = false;
  nextLessonIsAvailable: boolean = false;
  prevVideoTime: number = 0;
  videoStartTime: number = 0;

  getTemaStatusIcon(status: string): { icon: string, color: string } {
    switch (status) {
      case 'passed':
        return { icon: 'pi pi-check', color: 'green' }; // Урок пройден
      case 'passed-retake':
        return { icon: 'pi pi-refresh', color: 'orange' }; // Пересдача
      case 'opened':
        return { icon: 'pi pi-unlock', color: 'blue' }; // Открыт
      case 'expired':
        return { icon: 'pi pi-times-circle', color: 'red' }; // Просрочен
      case 'opened_retake':
        return { icon: 'pi pi-undo', color: 'purple' }; // Открыт на пересдачу
      case 'completed':
        return { icon: 'pi pi-check', color: 'green' }; // Завершен
      default:
        return { icon: 'pi pi-lock', color: 'red' }; // Закрыт
    }
  }




  ngOnInit() {

    this.player = new Plyr(this.videoElement.nativeElement, { captions: { active: true } });

    const video = this.videoElement.nativeElement;

    this.player.on('timeupdate', this.saveVideoTimeUpdate.bind(this));
    this.player.on('ended', this.saveVideoFinish.bind(this));



    this.route.paramMap.subscribe(params => {
      const lessonIdParam = params.get('lessonId');
      console.log('Lesson ID from route params:', lessonIdParam);

      if (lessonIdParam) {
        this.lessonId = +lessonIdParam;  // Convert to number
        console.log('Assigned lessonId:', this.lessonId);

        this.getLesson(this.lessonId);
        this.loadLessonVideo(this.lessonId);
        this.checkLessonProgress(this.lessonId);

        this.checkProgressInterval = setInterval(() => this.checkLessonProgress(this.lessonId), 5000);
      } else {
        console.error('Lesson ID is missing or invalid');
      }
    })

  }

  public getLesson(lessonId: number) {
    this.learnerCourseService.getLesson(lessonId).subscribe((data) => {
      console.log('Data received:', data);

      this.lessons = data.lessons;
      this.courseName = data.course_name;
      this.topicName = data.topic_name;
      this.lessonName = data.lesson_name;
      this.teacherName = data.teacher_fullname
      this.lessonIndex = data.lesson_number
      // this.video = `http://127.0.0.1:8000${this.lesson.video}`
      this.calculateProgress();
    })
  }

  // Метод для вычисления прогресса
  public calculateProgress() {
    const totalLessons = this.lessons.length;
    const passedLessons = this.lessons.filter(lesson => lesson.status === 'passed').length; // Количество пройденных уроков

    // Вычисляем процент
    if (totalLessons > 0) {
      this.progress = (passedLessons / totalLessons) * 100;
    }
  }

  public back() {
    this.router.navigate([`/student/courses/${this.lesson.course_id}`]);
  }

  public nextLesson() {
    this.router.navigate([`/student/lesson/${this.lesson.next_lesson_id}`]);
  }


  goToLesson(lessonId: number) {
    console.log(`Переход к уроку с ID: ${lessonId}`);
  }

  saveVideoTimeUpdate(): void {
    if (!this.nextLessonIsAvailable) {
      const currentTime = this.player.currentTime; // Текущее время видео

      // Если время не было зафиксировано ранее
      if (!this.firstVideoStartTimeSaved) {
        this.firstVideoStartTimeSaved = true;
        this.videoStartTime = currentTime; // Фиксируем стартовое время
        this.prevVideoTime = currentTime; // Изначально prev тоже равен текущему времени
      }

      // Проверка, перемотал ли пользователь видео больше чем на 2 секунды
      if (Math.abs(currentTime - this.prevVideoTime) > 2) {
        // Если да, отправляем запрос на сервер
        this.videoService.sendVideoTimeUpdate(this.videoStartTime, this.prevVideoTime,this.lessonId).subscribe(() => {
          console.log(`Прогресс сохранён: start = ${this.videoStartTime}, prev = ${this.prevVideoTime}`);
        });

        // Обновляем start, prev, и текущее время после отправки запроса
        this.videoStartTime = currentTime;
        this.prevVideoTime = currentTime;
      } else {
        // Если разница меньше 2 секунд, просто обновляем prev
        this.prevVideoTime = currentTime;
      }
    }
  }


  saveVideoFinish(): void {
    if (!this.nextLessonIsAvailable) {
      this.videoService.sendVideoTimeUpdate(this.videoStartTime, this.prevVideoTime,this.lessonId).subscribe(() => {
        this.firstVideoStartTimeSaved = false;
        this.videoStartTime = 0;
        this.prevVideoTime = 0;
      });
    }
  }


  checkLessonProgress(lessonId: number): void {
    this.videoService.checkProgress(lessonId).subscribe((response: any) => {
      this.nextLessonIsAvailable = response.next_lesson_is_available;

      if (this.nextLessonIsAvailable) {
        console.log('Следующий урок доступен');
      } else {
        console.log('Следующий урок пока недоступен');
      }
    }, (error) => {
      console.error('Ошибка при проверке прогресса:', error);
    });
  }

  loadLessonVideo(lessonId: number) {
    this.videoUrl = this.videoService.getLessonVideoUrl(lessonId, 720); // Default to 720p
    const video480Url = this.videoService.getLessonVideoUrl(lessonId, 480);
    const video720Url = this.videoService.getLessonVideoUrl(lessonId, 720);

    this.player.source = {
      type: 'video',
      sources: [
        {
          src: video720Url,
          type: 'video/mp4',
          size: 720
        },
        {
          src: video480Url,
          type: 'video/mp4',
          size: 480
        }
      ]
    };
  }

  changeQuality(quality: number) {
    let videoUrl: string = '';  // Initialize videoUrl with an empty string

    if (quality === 720) {
      videoUrl = this.videoService.getLessonVideoUrl(this.lessonId, 720);
    } else if (quality === 480) {
      videoUrl = this.videoService.getLessonVideoUrl(this.lessonId, 480);
    }

    // Ensure videoUrl is valid before using it
    if (videoUrl) {
      // Update Plyr player with the new video source
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

      // Optionally play the video after switching quality
      this.player.once('loadedmetadata', () => {
        this.player.play(); // Play after switching
      });
    } else {
      console.error('Video URL is not defined for the selected quality.');
    }
  }







}
