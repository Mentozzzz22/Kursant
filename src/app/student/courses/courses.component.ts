import {Component, inject, OnInit} from '@angular/core';
import {NgForOf} from "@angular/common";
import {kurs} from "../../non-authorized/main-page/main-page.component";
import {ProgressBarModule} from "primeng/progressbar";
import {Router} from "@angular/router";
import {LearnerCourseService} from "../../service/learner-course.service";
import {LearnerCourses} from "../../../assets/models/learner_courses.interface";

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    NgForOf,
    ProgressBarModule
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {

  private learnerCourseService = inject(LearnerCourseService)
  private router = inject(Router);

  public progress: number = 10;
  public courses: LearnerCourses[] = [];

  ngOnInit() {
    this.getCourses()
  }

  public getCourses() {
    this.learnerCourseService.getCourses().subscribe((data) => {
        this.courses = data.map(course => ({
          ...course,
          poster: `http://127.0.0.1:8000${course.poster}`
        }));
        console.log(this.courses)
      },
      (error) => {
        console.error('Error fetching courses:', error);
      });
  }


  // Метод для перехода на страницу курса
  goToCourse(courseId: number): void {
    this.router.navigate(['/student/courses', courseId]);
  }
}
