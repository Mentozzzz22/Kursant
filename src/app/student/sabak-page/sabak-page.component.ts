import {Component, inject, input, OnInit} from '@angular/core';
import {ProgressBarModule} from "primeng/progressbar";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {NgClass, NgIf} from "@angular/common";
import {MenuItem} from "primeng/api";
import {LearnerCourseService} from "../../service/learner-course.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LearnerLessons} from "../../../assets/models/learner_course.interface";
import {LearnerLesson} from "../../../assets/models/learner_lesson.interface";

@Component({
  selector: 'app-sabak-page',
  standalone: true,
  imports: [
    ProgressBarModule,
    BreadcrumbModule,
    NgClass,
    NgIf
  ],
  templateUrl: './sabak-page.component.html',
  styleUrl: './sabak-page.component.css'
})
export class SabakPageComponent implements OnInit {

  private learnerCourseService = inject(LearnerCourseService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  public lessonId!: number;
  public lessons: LearnerLessons[] = [];
  public lesson!: LearnerLesson;
  public courseName!: string;
  public topicName!: string;
  public lessonName!: string;
  public teacherName!: string;
  public lessonIndex!: number;
  public video!: string;

  public progress: number = 0;

  getTemaStatusIcon(status: string): string {
    if (status === 'passed') {
      return 'assets/images/finished.svg';
    } else if (status === 'passed-retake') {
      return 'assets/images/passed-retake.svg';
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

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.lessonId = +params.get('lessonId')!;
      this.getLesson(this.lessonId)
    });
  }

  public getLesson(lessonId: number) {
    this.learnerCourseService.getLesson(lessonId).subscribe((data) => {
      console.log('Data received:', data);
      this.lesson = data;
      this.lessons = data.lessons;
      this.courseName = data.course_name;
      this.topicName = data.topic_name;
      this.lessonName = data.lesson_name;
      this.teacherName = data.teacher_fullname
      this.lessonIndex = data.lesson_number
      this.video = `http://127.0.0.1:8000${this.lesson.video}`
      this.calculateProgress();
    })
  }

  // Метод для вычисления прогресса
  public calculateProgress() {
    const totalLessons = this.lessons.length; // Общее количество уроков
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

}
