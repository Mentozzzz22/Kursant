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
import {addDays, startOfWeek, isToday, subWeeks, addWeeks, subMonths, addMonths, isSameDay} from "date-fns";
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
  todayTasks: CalendarEvent[] = [];
  selectedDateEvents: CalendarEvent[] = [];
  startTime: Date | null | undefined = null;
  endTime: Date | null | undefined = null;
  primaryColor:string | undefined='';
  secondaryColor:string | undefined='';
  eventTitle: string | undefined='';
  private scrollTimeout: any;
  isEventClicked : boolean | null = null;
  CalendarView = CalendarView;
  weekView: CalendarView = CalendarView.Week;
  monthView: CalendarView = CalendarView.Month;
  selectedTaskDetails: any;

  calendar:any[]=[];

  ngOnInit() {
    registerLocaleData(localeKk);



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
            displayTitle = item.title; // Keep the original title with \n
            displaySubtitle = item.subtitle
          }

          const color = item.type === 'test' ? { primary: '#1E90FF', secondary: '#D1E8FF' } :
            item.type === 'homework' ? { primary: '#6E63E5', secondary: '#D4D0FF' } :
              item.type === 'many' ? { primary: '#FF6347', secondary: '#FFDAB9' } :
                { primary: '#6E63E5', secondary: '#D4D0FF' };

          const event = {
            id:item.id,
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
            type: item.type
          };

          console.log('Generated event:', event);
          return event;
        })
        .filter((event: any) => event !== null && event !== undefined);

      console.log('Final events array:', this.events);

      this.loadTodayTasks();
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

  moveToPreviousMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  // Move to the next month
  moveToNextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
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

  goBackToTaskList(): void {
    this.selectedTaskDetails = null;
    this.isEventClicked = false; // Reset to show today's tasks again
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

    if (event.type === 'many' && event.title.includes('\n')) {
      // Handle 'many' type by splitting the title and displaying in task list
      this.selectedTaskDetails = false;
      this.isEventClicked = true;
      this.selectedDateEvents = event.title.split('\n').map((titlePart) => ({
        ...event,
        title: titlePart,
        start: event.start,
        end: event.end,
      }));
    } else {
      this.selectedTaskDetails = true;
      this.isEventClicked = true;
      this.fetchEventDetails(event.id, event.type,event.start);
    }
  }


  loadTodayTasks(): void {
    const today = new Date();

    this.todayTasks = this.events.reduce((acc, event) => {
      const eventDate = new Date(event.start);

      if (eventDate.toDateString() === today.toDateString()) {
        if (event.title.includes('\n')) {
          const splitEvents = event.title.split('\n').map((titlePart) => ({
            ...event,
            title: titlePart,
            start: event.start,
            end: event.end,
          }));
          acc.push(...splitEvents);
        } else {
          acc.push(event);
        }
      }

      return acc;
    }, [] as CalendarEvent[]);

    console.log('Today\'s tasks:', this.todayTasks);

    this.selectedTaskDetails = null;
  }

  fetchEventDetails(eventId: string | number | undefined, eventType: string | undefined, time: Date): void {
    if(eventType == 'many'){
      this.calendarService.getCalendarTypeMany(time).subscribe((response: any) => {
        console.log('Event details:', response);
        this.selectedTaskDetails = response;
        this.selectedTaskDetails.deadline = this.convertToDate(this.selectedTaskDetails.deadline);
      }, error => {
        console.error('Error fetching event details:', error);
      });
    }else{
      this.calendarService.getCalendarItem(eventId, eventType).subscribe((response: any) => {
        console.log('Event details:', response);
        this.selectedTaskDetails = response;
        this.selectedTaskDetails.deadline = this.convertToDate(this.selectedTaskDetails.deadline);
      }, error => {
        console.error('Error fetching event details:', error);
      });
    }
  }

  fetchEventDetailsMany(time: Date): void {

  }

  onDayClicked(day: { date: Date }): void {
    this.viewDate = day.date;
    this.loadTodayTasks();
  }

  // beforeViewRender(event: CalendarWeekViewBeforeRenderEvent): void {
  //   event.period.events.forEach(weekEvent => {
  //     const startTime = this.formatTime(weekEvent.start);
  //     const endTime = this.formatTime(weekEvent.end);
  //     weekEvent.title = `${startTime} - ${endTime} ${weekEvent.title}`;
  //   });
  // }
  //
  // getEventClass(event: CalendarEvent): string {
  //   return event.title === 'Тест' ? 'test' : 'testant';
  // }

  convertToDate(tuple: string): Date | null {
    if (!tuple) return null;

    // Remove the parentheses and split the string into an array
    const dateParts = tuple.replace(/[()]/g, '').split(',').map(Number);

    // Create a JavaScript Date object: new Date(year, month - 1, day, hour, minute)
    // Subtract 1 from the month because JavaScript months are 0-based (0 = January)
    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], dateParts[3], dateParts[4]);
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

