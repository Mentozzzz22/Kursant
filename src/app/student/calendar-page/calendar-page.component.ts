import {Component, LOCALE_ID, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf, registerLocaleData} from "@angular/common";
import {CalendarMonthModule, CalendarWeekModule} from "angular-calendar";
import {
  CalendarEvent,
  CalendarView
} from 'angular-calendar';
import localeKk from '@angular/common/locales/kk'; // Импорт казахской локали

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    CalendarWeekModule,
    CalendarMonthModule,
    DatePipe
  ],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.css',
  providers: [
    { provide: LOCALE_ID, useValue: 'kk-KZ' } // Устанавливаем казахскую локаль
  ]
})
export class CalendarPageComponent implements OnInit {
  viewDate: Date = new Date();
  todayEvents: CalendarEvent[] = [];

  CalendarView = CalendarView;
  // Один календарь для недельного представления
  weekView: CalendarView = CalendarView.Week;
  // Другой календарь для месячного представления
  monthView: CalendarView = CalendarView.Month;

  ngOnInit() {
    registerLocaleData(localeKk); // Регистрируем казахскую локаль

    this.loadTodayEvents();
  }
  events: CalendarEvent[] = [
    {
      start: new Date(new Date().setHours(1, 30)),
      end: new Date(new Date().setHours(2, 30)),
      title: 'Тест',
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: false,
    },
    {
      start: new Date(new Date().setHours(4, 30)),
      end: new Date(new Date().setHours(5, 30)),
      title: 'Домашняя работа',
      color: { primary: '#ff5722', secondary: '#ffccbc' },
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: false,
    },
  ];

  loadTodayEvents() {
    const today = new Date();
    this.todayEvents = this.events.filter(event => {
      return (
        event.start.getDate() === today.getDate() &&
        event.start.getMonth() === today.getMonth() &&
        event.start.getFullYear() === today.getFullYear()
      );
    });
  }

  handleEvent(action: string, event: { event: CalendarEvent; sourceEvent: MouseEvent | KeyboardEvent }): void {
    console.log('Event clicked', event);
  }

  onDayClicked(day: { date: Date }): void {
    this.viewDate = day.date;
    this.loadTodayEvents(); // обновляем события на выбранный день
  }
}

