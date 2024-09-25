import {Component, HostListener, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {kurs} from "../../non-authorized/main-page/main-page.component";
import {ProgressBarModule} from "primeng/progressbar";
import {Router} from "@angular/router";
import {LearnerCourseService} from "../../service/learner-course.service";
import {LearnerCourses, OtherCourses} from "../../../assets/models/learner_courses.interface";

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    NgForOf,
    ProgressBarModule,
    NgIf
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  isMobileView: boolean = false;
  @HostListener('window:resize', [])
  onResize() {
    this.checkWindowSize();
  }

  private learnerCourseService = inject(LearnerCourseService)
  private router = inject(Router);


  public learnerCourses: LearnerCourses[] = [];
  public otherCourses: OtherCourses[] = [];

  ngOnInit() {
    this.getCourses()
  }

  public getCourses() {
    this.learnerCourseService.getCourses().subscribe(
      (data: { learner_courses: LearnerCourses[]; other_courses: OtherCourses[] }) => {
        this.learnerCourses = data.learner_courses.map(course => ({
          ...course,
          poster: `http://127.0.0.1:8000${course.poster}`
        }));

        this.otherCourses = data.other_courses.map(course => ({
          ...course,
          poster: `http://127.0.0.1:8000/media/${course.poster}`
        }));

        console.log('Learner Courses:', this.learnerCourses);
        console.log('Other Courses:', this.otherCourses);
      },
      (error) => {
        console.error('Error fetching courses:', error);
      }
    );
  }


  checkWindowSize(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  goToCourse(courseId: number): void {
    this.router.navigate(['/student/courses', courseId]);
  }
}
