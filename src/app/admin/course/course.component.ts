import {Component, inject, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {NgForOf} from "@angular/common";
import {kurs} from "../../non-authorized/main-page/main-page.component";
import {SuperAdminService} from "../../service/super-admin.service";
import {Courses} from "../../../assets/models/courses.interface";

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgForOf
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent implements OnInit{

  private superAdminService = inject(SuperAdminService);

  public courses: Courses[] = [];

  public kurstar: kurs[] = [
    {
      id: 1,
      img: 'assets/images/subject1.svg',
      subjectName: 'Қазақстан тарихы',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    }, {
      id: 2,
      img: 'assets/images/subject2.svg',
      subjectName: 'Математика',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    }, {
      id: 3,
      img: 'assets/images/subject3.svg',
      subjectName: 'Физика',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    }, {
      id: 4,
      img: 'assets/images/subject4.svg',
      subjectName: 'Информатика',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    }, {
      id: 5,
      img: 'assets/images/subject5.svg',
      subjectName: 'География',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    }, {
      id: 6,
      img: 'assets/images/subject6.svg',
      subjectName: 'Ағылшын тілі',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    },
  ]

  ngOnInit(){
    this.loadEmployees()
  }

  private loadEmployees() {
    this.superAdminService.getCourses().subscribe(data => {
      this.courses = data;
      console.log(data)
    })
  }
}
