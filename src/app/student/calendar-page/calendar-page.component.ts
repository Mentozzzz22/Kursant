import {Component, inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle, registerLocaleData, SlicePipe, UpperCasePipe} from "@angular/common";
import {
  CalendarModule,
  CalendarMonthModule,
  CalendarWeekModule,
  CalendarWeekViewBeforeRenderEvent
} from "angular-calendar";
import {
  CalendarEvent} from 'angular-calendar';
import localeKk from '@angular/common/locales/kk';
import {addDays, startOfWeek, isToday, subWeeks, addWeeks, subMonths, addMonths} from "date-fns";
import {CalendarService} from "../../service/calendar.service";
import {UserService} from "../../service/user.service";
import {interval, startWith, Subject, Subscription} from "rxjs";
import {map} from "rxjs/operators";
import {environment} from "../../../environments/environment";

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
export class CalendarPageComponent implements OnInit, OnDestroy  {
  calendarService = inject(CalendarService);
  datePipe = inject(DatePipe);
  private userService = inject(UserService);
  public userUrl = environment.apiUrl
  viewDate: Date = new Date();
  currentDate: Date = new Date();
  todayTasks: CalendarEvent[] = [];
  chooseDayTasks: CalendarEvent[] = [];
  selectedDateEvents: CalendarEvent[] = [];
  startTime: Date | null | undefined = null;
  endTime: Date | null | undefined = null;
  primaryColor:string | undefined='';
  secondaryColor:string | undefined='';
  eventTitle: string | undefined='';
  // private scrollTimeout: any;
  isEventClicked : boolean | null = null;
  // CalendarView = CalendarView;
  // weekView: CalendarView = CalendarView.Week;
  // monthView: CalendarView = CalendarView.Month;
  selectedTaskDetails: any[] | any = null;
  token : string | null = '';
  private currentTimeRefresh$: Subscription | null = null;
  refresh$: Subject<any> = new Subject();


  calendar:any[]=[];

  ngOnInit() {
    registerLocaleData(localeKk);

    this.loadCalendar();
    this.token = this.userService.token;
    this.currentTimeRefresh$ = interval(60000)
      .pipe(
        startWith(0),
        map(() => new Date())
      )
      .subscribe((currentDate: Date) => {
        this.currentDate = currentDate;
        this.refresh$.next({});

        console.log(`Current time updated: ${this.currentDate}`);
      });
  }

  ngOnDestroy() {
    if (this.currentTimeRefresh$) {
      this.currentTimeRefresh$.unsubscribe();
    }
  }

  loadCalendar() {
    this.calendarService.getCalendar().subscribe(data => {
      const uniqueEvents = new Map<string, boolean>();

      this.events = data
        .map((item: { id: number | null; start: string; title: string; subtitle: string | null; type: string }) => {
          if (!item.start || !item.title) {
            return null;
          }

          const { start, end } = this.parseDateString(item.start);

          const eventKey = item.id ? `event-${item.id}` : `${item.title}-${start.toISOString()}`;

          if (uniqueEvents.has(eventKey)) {
            return null;
          }

          uniqueEvents.set(eventKey, true);

          let displayTitle = item.title;
          let displaySubtitle = item.subtitle;
          if (item.type === 'many' && item.title.includes('\n')) {
            displayTitle = item.title;
            displaySubtitle = item.subtitle
          }

          const color = item.type === 'test' ? { primary: '#6E63E5', secondary: '#D4D0FF' } :
            item.type === 'homework' ? { primary: '#FFB37E', secondary: '#FFDAB9' } :
              item.type === 'testant' ? { primary: '#F93C65', secondary: '#FFD1D1' } :
                item.type === 'many' ? { primary: '#A0D468', secondary: '#E6F5D0' } :  // зеленый оттенок
                  item.type === 'meet' ? { primary: '#00B0EA', secondary: '#D1F0FF' } :
                    { primary: '#6E63E5', secondary: '#D4D0FF' };


          const event = {
            id:item.id,
            start: start,
            end: end,
            title: displayTitle,
            subtitle: displaySubtitle,
            color: color,
            resizable: {
              beforeStart: false,
              afterEnd: false,
            },
            draggable: false,
            type: item.type
          };

          return event;
        })
        .filter((event: any) => event !== null && event !== undefined);


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

  moveToNextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }


  events: CalendarEvent[] = [];

  handleBeforeViewRender(event: CalendarWeekViewBeforeRenderEvent): void {
    event.period.events.forEach(e => {
      const formattedStartTime = e.start ? e.start.toLocaleString() : 'No start time';
      const formattedEndTime = e.end ? e.end.toLocaleString() : 'No end time';



      this.eventTitle = e.title;
      this.primaryColor = e.color?.primary;
      this.secondaryColor = e.color?.secondary;
      this.startTime = e.start;
      this.endTime = e.end;
    });
  }

  goBackToTaskList(): void {
    this.selectedTaskDetails = false;
    this.isEventClicked = true;
  }


  getWeekDays(): Date[] {
    const start = startOfWeek(this.viewDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  isToday(date: Date): boolean {
    return isToday(date);
  }

  onEventClicked(event: CalendarEvent): void {
    if (event.type === 'many') {
      this.isEventClicked = true;
      this.calendarService.getCalendarTypeMany(event.start).subscribe((response) => {
        this.selectedDateEvents = event.title.split('\n').map((titlePart, index) => {
          const matchedEvent = response.find((e: { title: string; }) => e.title === titlePart.trim());
          return {
            ...event,
            title: titlePart.trim(),
            start: event.start,
            end: event.end,
            id: matchedEvent ? matchedEvent.id : null,
            type :matchedEvent.type
          };
        });
      });
      this.selectedTaskDetails = null;
    } else {
      this.selectedTaskDetails = true;
      this.isEventClicked = true;
      this.fetchEventDetails(event.id, event.type, event.start);
    }
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
        this.selectedTaskDetails.start = this.convertToDate(this.selectedTaskDetails.start);
      }, error => {
        console.error('Error fetching event details:', error);
      });
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


    this.selectedTaskDetails = null;
  }

  loadDayTasks(day: Date): void {
    this.chooseDayTasks = this.events.reduce((acc, event) => {
      const eventDate = new Date(event.start);

      if (eventDate.toDateString() === day.toDateString()) {
        if (event.title.includes('\n')) {
          this.calendarService.getCalendarTypeMany(event.start).subscribe((response) => {
            const splitEvents = event.title.split('\n').map((titlePart) => {
              const matchedEvent = response.find((e: { title: string; }) => e.title === titlePart.trim());
              return {
                ...event,
                title: titlePart.trim(),
                start: event.start,
                end: event.end,
                id: matchedEvent ? matchedEvent.id : null,
                type: matchedEvent ? matchedEvent.type : event.type
              };
            });
            acc.push(...splitEvents);
          });
        } else {
          acc.push(event);
        }
      }

      return acc;
    }, [] as CalendarEvent[]);

    this.selectedDateEvents = this.chooseDayTasks;
    this.selectedTaskDetails = null;
  }




  onDayClicked(day: { date: Date }): void {
    this.viewDate = day.date;
    this.loadDayTasks(this.viewDate)
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
    const dateParts = tuple.replace(/[()]/g, '').split(',').map(Number);
    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], dateParts[3], dateParts[4]);
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

  protected readonly Array = Array;
}

