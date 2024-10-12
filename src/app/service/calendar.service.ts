import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {LearnerCourses, OtherCourses} from "../../assets/models/learner_courses.interface";
import {LearnerCourse} from "../../assets/models/learner_course.interface";

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = environment.apiUrl + '/api/learner_calendar';
  private userService = inject(UserService);
  private http = inject(HttpClient)
  constructor() { }


  public getCalendar(): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.get<any>(`${this.apiUrl}/get_learner_calendar`, {headers});
  }

  public getCalendarItem(eventId: string | number | undefined, eventType: string | undefined): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const url = `${this.apiUrl}/get_calendar_item/?id=${eventId}&type=${eventType}`;

    return this.http.get<any>(url, { headers });
  }

  public getCalendarTypeMany(time: Date): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const requestBody = {
      time: this.convertDateToBackendFormat(time),
    };

    return this.http.get<any>(`${this.apiUrl}/get_calendar_items_separated/`, {
      headers,
      params: { time: requestBody.time },
    });
  }

  private convertDateToBackendFormat(date: Date): string {
    return `(${date.getFullYear()}, ${date.getMonth() + 1}, ${date.getDate()}, ${date.getHours()}, ${date.getMinutes()})`;
  }
}
