import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {GetCourseList, Grades} from "../../assets/models/grades.interface";

@Injectable({
  providedIn: 'root'
})
export class GradesService {

  private apiUrl = environment.apiUrl + '/api/learner_course';
  private courseUrl = environment.apiUrl + '/api/course';
  private userService = inject(UserService);
  private http = inject(HttpClient)

  public getCoursesList(): Observable<GetCourseList[]> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.get<GetCourseList[]>(`${this.apiUrl}/get_courses_list/`, { headers });
  }

  public getMarks(id: number): Observable<Grades[]> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('learner_course_id', id.toString());

    return this.http.get<Grades[]>(`${this.apiUrl}/get_marks/`,
      {headers, params}
    );
  }
}
