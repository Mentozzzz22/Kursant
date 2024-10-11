import {Component, inject, LOCALE_ID, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle, registerLocaleData, SlicePipe, UpperCasePipe} from "@angular/common";
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
import {CalendarService} from "../../service/calendar.service";

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
    SlicePipe,
    UpperCasePipe,
  ],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.css',
  providers: [
    { provide: LOCALE_ID, useValue: 'kk-KZ' }
  ]
})
export class CalendarPageComponent implements OnInit {
  calendarService = inject(CalendarService);

  viewDate: Date = new Date();
  currentDate: Date = new Date();
  todayEvents: CalendarEvent[] = [];
  startTime: Date | null | undefined = null;
  endTime: Date | null | undefined = null;
  primaryColor:string | undefined='';
  secondaryColor:string | undefined='';
  eventTitle: string | undefined='';
  private scrollTimeout: any;
  private isScrollingRight: boolean | null = null;
  CalendarView = CalendarView;
  weekView: CalendarView = CalendarView.Week;
  monthView: CalendarView = CalendarView.Month;

  calendar:any[]=[];

  ngOnInit() {
    registerLocaleData(localeKk);

    this.loadTodayEvents();

    this.loadCalendar()
  }

  loadCalendar() {
    this.calendarService.getCalendar().subscribe(data => {
      const uniqueEvents = new Map<string, boolean>();

      this.events = data.map((item: { id: number | null; start: string; title: string; subtitle: string | null; type: string }) => {
        const { start, end } = this.parseDateString(item.start);

        // Создаем уникальный ключ для события по названию и времени начала
        const eventKey = item.id ? `event-${item.id}` : `${item.title}-${start.toISOString()}`;

        if (uniqueEvents.has(eventKey)) {
          return null; // Пропускаем дубликат
        }

        uniqueEvents.set(eventKey, true);

        // Обработка типа `many`: объединяем заголовки в один блок с конкретным форматированием
        let displayTitle = item.title;
        let displaySubtitle = item.subtitle;
        if (item.type === 'many' && item.title.includes('\n')) {
          const titles = item.title.split('\n');
          displayTitle = titles.join(' | '); // Объединяем заголовки в одну строку, разделяя их вертикальной чертой
          displaySubtitle = item.subtitle; // Если есть подзаголовок, сохраняем его
        }

        const color = item.type === 'test' ? { primary: '#1E90FF', secondary: '#D1E8FF' } :
          item.type === 'homework' ? { primary: '#6E63E5', secondary: '#D4D0FF' } :
            item.type === 'many' ? { primary: '#FF6347', secondary: '#FFDAB9' } :
              { primary: '#6E63E5', secondary: '#D4D0FF' };

        return {
          start: start,
          end: end,
          title: displayTitle,
          subtitle: displaySubtitle,
          color: color,
          resizable: {
            beforeStart: true,
            afterEnd: true,
          },
          draggable: false,
        };
      }).filter((event: null) => event !== null);
    });
  }







  parseDateString(dateString: string): { start: Date, end: Date } {
    const dateParts = dateString
      .replace(/[()]/g, '') // Убираем скобки
      .split(', ')
      .map(part => parseInt(part, 10)); // Преобразуем компоненты в числа

    const startDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], dateParts[3], dateParts[4]);

    const endDate = new Date(startDate.getTime() + 90 * 60 * 1000); // Добавляем 1.5 часа

    return { start: startDate, end: endDate };
  }




  events: CalendarEvent[] = [];

  handleBeforeViewRender(event: CalendarWeekViewBeforeRenderEvent): void {
    event.period.events.forEach(e => {
      const formattedStartTime = e.start ? e.start.toLocaleString() : 'No start time';
      const formattedEndTime = e.end ? e.end.toLocaleString() : 'No end time';

      console.log(`Event title: ${e.title}`);
      console.log(`Event color: ${e.color?.secondary}`);
      console.log(`Start time: ${formattedStartTime}`);
      console.log(`End time: ${formattedEndTime}`);

      this.eventTitle = e.title;
      this.primaryColor = e.color?.primary;
      this.secondaryColor = e.color?.secondary;
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


  // onScroll(event: any): void {
  //   const scrollLeft = event.target.scrollLeft;
  //   const maxScrollLeft = event.target.scrollWidth - event.target.clientWidth;
  //
  //   if (scrollLeft === 0 && this.isScrollingRight === false) {
  //     this.previousWeek();
  //     this.isScrollingRight = null;
  //   } else if (scrollLeft >= maxScrollLeft && this.isScrollingRight === true) {
  //     this.nextWeek();
  //     this.isScrollingRight = null;
  //   } else {
  //     this.isScrollingRight = scrollLeft > maxScrollLeft / 2;
  //   }
  // }

  previousWeek(): void {
    this.viewDate = subWeeks(this.viewDate, 1);
  }

  nextWeek(): void {
    this.viewDate = addWeeks(this.viewDate, 1);
  }
}

