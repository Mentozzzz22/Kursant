import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {Courses} from "../../assets/models/courses.interface";
import {Course} from "../../assets/models/course.interface";
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl = 'http://127.0.0.1:8000/api/course';
  private http = inject(HttpClient);
  private userService = inject(UserService);


  public getCourses(): Observable<Courses[]> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    return this.http.get<Courses[]>(`${this.apiUrl}/get_courses/`,
      {headers}
    );
  }

  public getCourse(id: number): Observable<Course> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('id', id.toString());

    return this.http.get<Course>(`${this.apiUrl}/get_course/`,
      {headers, params}
    );
  }

  saveCourse(courseData: FormData): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);  // Без установки Content-Type

    // Отправляем запрос с FormData
    return this.http.post(`${this.apiUrl}/save_course/`, courseData, { headers }).pipe(
      catchError(error => {
        console.error('Save course failed:', error);
        return throwError(error);
      })
    );
  }

  deleteEmployee(id: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post<any>(`${this.apiUrl}/delete_course/`, {id},
      {headers}
    );
  }
}
