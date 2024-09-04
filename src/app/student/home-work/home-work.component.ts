import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common";

interface Homework {
  subject: string;
  description: string;
  date: string;
  time: string;
  score: string;
  status: string;
}

@Component({
  selector: 'app-home-work',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf
  ],
  templateUrl: './home-work.component.html',
  styleUrl: './home-work.component.css'
})
export class HomeWorkComponent implements OnInit{
  homeworks: Homework[] = [
    { subject: 'Тарих', description: 'Адамзаттың пайда болуы', date: '09/09/2024', time: '23:59', score: '89/100', status: 'completed' },
    { subject: 'Математика', description: 'Адамзаттың пайда болуы', date: '09/09/2024', time: '23:59', score: '--/100', status: 'incomplete' },
    { subject: 'Физика', description: 'Адамзаттың пайда болуы', date: '09/09/2024', time: '23:59', score: '--/100', status: 'pending' },
  ];

  isLate(date: string, time: string): boolean {
    const homeworkDate = new Date(`${date} ${time}`);
    return homeworkDate < new Date();
  }

  ngOnInit(): void {
  }
}
