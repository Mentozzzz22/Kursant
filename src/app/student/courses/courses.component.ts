import {Component, inject} from '@angular/core';
import {NgForOf} from "@angular/common";
import {kurs} from "../../non-authorized/main-page/main-page.component";
import {ProgressBarModule} from "primeng/progressbar";
import {Router} from "@angular/router";

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
export class CoursesComponent {

  private router = inject(Router);

  public progress: number = 76;

  public subjectAndTeacher: any = [
    {
      subject: 'Физика',
      teacher: 'Мендыбаев Абай'
    }, {
      subject: 'Физика',
      teacher: 'Мендыбаев Абай'
    }, {
      subject: 'Информатика',
      teacher: 'Мендыбаев Абай'
    }, {
      subject: 'Информатика',
      teacher: 'Мендыбаев Абай'
    }, {
      subject: 'Математика',
      teacher: 'Мендыбаев Абай'
    }, {
      subject: 'Математика',
      teacher: 'Мендыбаев Абай'
    }, {
      subject: 'Тарих',
      teacher: 'Мендыбаев Абай'
    }, {
      subject: 'Тарих',
      teacher: 'Мендыбаев Абай'
    },
  ]

  public kurstar: kurs[] = [
    {
      id: 1,
      img: 'assets/images/subject1.svg',
      subjectName: 'Қазақстан тарихы',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      progress: 76,
      price: 70000,
    }, {
      id: 2,
      img: 'assets/images/subject2.svg',
      subjectName: 'Математика',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      progress: 76,
      price: 70000,
    }, {
      id: 3,
      img: 'assets/images/subject3.svg',
      subjectName: 'Физика',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      progress: 76,
      price: 70000,
    }, {
      id: 4,
      img: 'assets/images/subject4.svg',
      subjectName: 'Информатика',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      progress: 76,
      price: 70000,
    }, {
      id: 5,
      img: 'assets/images/subject5.svg',
      subjectName: 'География',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      progress: 76,
      price: 70000,
    }, {
      id: 6,
      img: 'assets/images/subject6.svg',
      subjectName: 'Ағылшын тілі',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      progress: 76,
      price: 70000,
    },
  ]
  // Метод для перехода на страницу курса
  goToCourse(courseId: number): void {
    this.router.navigate(['/student/courses', courseId]);
  }
}
