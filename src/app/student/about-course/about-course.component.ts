import {Component, inject, input, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {LearnerCourseService} from "../../service/learner-course.service";
import {LearnerModules} from "../../../assets/models/learner_course.interface";
import {ProgressBarModule} from "primeng/progressbar";


@Component({
  selector: 'app-about-course',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    ProgressBarModule
  ],
  templateUrl: './about-course.component.html',
  styleUrl: './about-course.component.css'
})
export class AboutCourseComponent implements OnInit {

  private learnerCourseService = inject(LearnerCourseService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  public courseId!: number;
  public modules: LearnerModules[] = []
  poster: string = '';
  public isOpen: boolean[] = [];
  public isOpenTopic: boolean[][] = [];
  public course: any = {};

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.courseId = +params.get('courseId')!;
      this.getCourse(this.courseId)
    });
  }

  public getCourse(courseId: number) {
    this.learnerCourseService.getCourse(courseId).subscribe((data) => {
      this.course = {
        name: data.name,
        modules_count: data.modules_count,
        lessons_count: data.lessons_count,
        teacherName: data.teacher_fullname,
        progress:data.progress,
      };

      this.modules = data.modules
      this.poster = `http://127.0.0.1:8000${data.poster}`
      console.log('Data received:', data);
      this.isOpen = new Array(this.modules.length).fill(false);
      this.isOpenTopic = this.modules.map(module => new Array(module.topics.length).fill(false));
    })
  }

  toggleBolim(index: number) {
    this.isOpen[index] = !this.isOpen[index];
  }

  toggleTema(bolimIndex: number, temaIndex: number) {
    this.isOpenTopic[bolimIndex][temaIndex] = !this.isOpenTopic[bolimIndex][temaIndex];
  }

  getTemaStatusIcon(status: string): string {
    if (status === 'passed') {
      return 'assets/images/finished.svg';
    } else if (status === 'opened') {
      return 'assets/images/opened.svg';
    } else if (status === 'expired') {
      return 'assets/images/expired.svg';
    } else if (status === 'opened_retake') {
      return 'assets/images/opened-retake.svg';
    } else {
      return 'assets/images/closed.svg';
    }
  }

  goToTest(testId: number): void {
    this.router.navigate(['/student/test', testId]);
  }

  goToHomework(homeworkId: number): void {
    this.router.navigate(['/student/homework', homeworkId]);
  }

  goToLesson(lessonId: number): void {
    this.router.navigate(['/student/lesson', lessonId]);
  }

}
