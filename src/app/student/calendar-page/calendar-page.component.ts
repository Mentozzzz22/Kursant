import {Component, inject, LOCALE_ID, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle, registerLocaleData, SlicePipe, UpperCasePipe} from "@angular/common";
import {
  CalendarModule,
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
    CalendarModule,
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

      this.events = data
        .map((item: { id: number | null; start: string; title: string; subtitle: string | null; type: string }) => {
          if (!item.start || !item.title) {
            console.warn('Skipping event due to missing data:', item);
            return null; // Skip if essential data is missing
          }

          const { start, end } = this.parseDateString(item.start);

          // Create a unique key for the event based on its title and start time
          const eventKey = item.id ? `event-${item.id}` : `${item.title}-${start.toISOString()}`;

          if (uniqueEvents.has(eventKey)) {
            console.warn('Duplicate event detected, skipping:', eventKey);
            return null; // Skip duplicate events
          }

          uniqueEvents.set(eventKey, true);

          // Handling the 'many' type by combining titles into one block
          let displayTitle = item.title;
          let displaySubtitle = item.subtitle;
          if (item.type === 'many' && item.title.includes('\n')) {
            const titles = item.title.split('\n');
            displayTitle = titles.join(' | '); // Combine titles into a single string with separator
            displaySubtitle = item.subtitle; // Preserve the subtitle if available
          }

          const color = item.type === 'test' ? { primary: '#1E90FF', secondary: '#D1E8FF' } :
            item.type === 'homework' ? { primary: '#6E63E5', secondary: '#D4D0FF' } :
              item.type === 'many' ? { primary: '#FF6347', secondary: '#FFDAB9' } :
                { primary: '#6E63E5', secondary: '#D4D0FF' };

          const event = {
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

          console.log('Generated event:', event);
          return event;
        })
        .filter((event: any) => event !== null && event !== undefined); // Ensure only valid events are kept

      console.log('Final events array:', this.events); // Log the final array of events
    });
  }




  parseDateString(dateString: string): { start: Date, end: Date } {
    const dateParts = dateString
      .replace(/[()]/g, '')
      .split(', ')
      .map(part => parseInt(part, 10));

    let startDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], dateParts[3], dateParts[4]);

    if (startDate.getHours() === 23 && startDate.getMinutes() === 59) {
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() + 1);
    }

    const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);

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

  onEventClicked(event: CalendarEvent): void {
    console.log('Event clicked:', event);
    // Here, you can add logic to display event details or trigger other actions
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

