import {Component, LOCALE_ID, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle, registerLocaleData} from "@angular/common";
import {
  CalendarMonthModule,
  CalendarWeekModule,
  CalendarWeekViewBeforeRenderEvent
} from "angular-calendar";
import {
  CalendarEvent,
  CalendarView
} from 'angular-calendar';
import localeKk from '@angular/common/locales/kk';
import {addDays, startOfWeek, isToday, subWeeks, addWeeks} from "date-fns";

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    CalendarWeekModule,
    CalendarMonthModule,
    DatePipe,
    NgStyle,
  ],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.css',
  providers: [
    { provide: LOCALE_ID, useValue: 'kk-KZ' }
  ]
})
export class CalendarPageComponent implements OnInit {
  viewDate: Date = new Date();
  todayEvents: CalendarEvent[] = [];
  startTime: Date | null | undefined = null;
  endTime: Date | null | undefined = null;
  private scrollTimeout: any;
  private isScrollingRight: boolean | null = null;
  CalendarView = CalendarView;
  weekView: CalendarView = CalendarView.Week;
  monthView: CalendarView = CalendarView.Month;

  ngOnInit() {
    registerLocaleData(localeKk);

    this.loadTodayEvents();


  }
  events: CalendarEvent[] = [
    {
      start: new Date(2024, 9, 9, 9, 30),
      end: new Date(2024, 9, 9, 10, 30),
      title: 'Тест',
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: false,
    },
    {
      start: new Date(2024, 9, 10, 14, 30),
      end: new Date(2024, 9, 10, 15, 30),
      title: 'Домашняя работа',
      color: { primary: '#ff5722', secondary: '#ffccbc' },
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: false,
    },
  ];

  handleBeforeViewRender(event: CalendarWeekViewBeforeRenderEvent): void {
    event.period.events.forEach(e => {
      console.log(`Event title: ${e.title}`);
      console.log(`Start time: ${e.start}`);
      console.log(`End time: ${e.end}`);

      this.startTime = e.start;
      this.endTime = e.end;
    });

  }

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

  getWeekDays(): Date[] {
    const start = startOfWeek(this.viewDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  isToday(date: Date): boolean {
    return isToday(date);
  }

  handleEvent(action: string, event: { event: CalendarEvent; sourceEvent: MouseEvent | KeyboardEvent }): void {
    console.log('Event clicked', event);
  }

  onDayClicked(day: { date: Date }): void {
    this.viewDate = day.date;
    this.loadTodayEvents();
  }

  beforeViewRender(event: CalendarWeekViewBeforeRenderEvent): void {
    event.period.events.forEach(weekEvent => {
      const startTime = this.formatTime(weekEvent.start);
      const endTime = this.formatTime(weekEvent.end);
      weekEvent.title = `${startTime} - ${endTime} ${weekEvent.title}`;
    });
  }

  getEventClass(event: CalendarEvent): string {
    return event.title === 'Тест' ? 'test' : 'testant';
  }

  private formatTime(date: Date | undefined): string {
    return new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  }


  onScroll(event: any): void {
    const scrollLeft = event.target.scrollLeft;
    const maxScrollLeft = event.target.scrollWidth - event.target.clientWidth;

    if (scrollLeft === 0 && this.isScrollingRight === false) {
      this.previousWeek();
      this.isScrollingRight = null;
    } else if (scrollLeft >= maxScrollLeft && this.isScrollingRight === true) {
      this.nextWeek();
      this.isScrollingRight = null;
    } else {
      this.isScrollingRight = scrollLeft > maxScrollLeft / 2;
    }
  }

  previousWeek(): void {
    this.viewDate = subWeeks(this.viewDate, 1);
  }

  nextWeek(): void {
    this.viewDate = addWeeks(this.viewDate, 1);
  }
}

