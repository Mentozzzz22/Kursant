import {Component} from '@angular/core';
import {CardModule} from "primeng/card";
import {Button} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {NgForOf} from "@angular/common";

export interface kurs {
  id: number,
  img: string,
  subjectName: string,
  bolim: number,
  sabak: number,
  closestPotok: string,
  progress?: number,
  price: number,
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CardModule,
    Button,
    InputTextModule,
    NgForOf,

  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {

  public subjectAndTeacher: any = [
    {
      subject: 'Физика',
      teacher: 'Мендыбаев Абай'
    },{
      subject: 'Физика',
      teacher: 'Мендыбаев Абай'
    },{
      subject: 'Информатика',
      teacher: 'Мендыбаев Абай'
    },{
      subject: 'Информатика',
      teacher: 'Мендыбаев Абай'
    },{
      subject: 'Математика',
      teacher: 'Мендыбаев Абай'
    },{
      subject: 'Математика',
      teacher: 'Мендыбаев Абай'
    },{
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



}
