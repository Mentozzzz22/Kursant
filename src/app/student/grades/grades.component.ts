import {Component, inject, OnInit} from '@angular/core';
import {GradesService} from "../../service/grades.service";
import {GetCourseList, Grades} from "../../../assets/models/grades.interface";
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass
  ],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.css'
})
export class GradesComponent implements OnInit {

  private gradesService = inject(GradesService);

  public courseList: GetCourseList[] = []
  public selectedCourse: GetCourseList | null = null;
  public selectedCourseId: number | null = null;
  public grades: Grades[] = [];

  ngOnInit() {
    this.getCourseList();
  }

  private getCourseList() {
    this.gradesService.getCoursesList().subscribe(data => {
      this.courseList = data;

      // Если список курсов не пуст, выбираем первый курс
      if (this.courseList.length > 0) {
        this.onCourseSelect(this.courseList[0]);
      }
    });
  }

  public onCourseSelect(course: GetCourseList) {
    this.selectedCourse = course;
    this.selectedCourseId = course.learner_course_id;  // Запоминаем ID выбранного курса
    this.getMarks(course.learner_course_id);
  }

  private getMarks(courseId: number) {
    this.gradesService.getMarks(courseId).subscribe(data => {
      this.grades = data;
    });
  }

}
