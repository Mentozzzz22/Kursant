import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {UserService} from "./user.service";
import {catchError, Observable, throwError} from "rxjs";
import {GetModules} from "../../assets/models/getModules.interface";
import {Module} from "../../assets/models/module.interface";

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private apiUrl = 'http://127.0.0.1:8000/api/course';
  private http = inject(HttpClient);
  private userService = inject(UserService);

  public getCourseModules(courseId: number): Observable<GetModules> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    // Добавляем course_id как параметр в запрос
    const params = new HttpParams().set('id', courseId.toString());

    return this.http
      .get<GetModules>(`${this.apiUrl}/get_course_modules/`, { headers, params })
      .pipe(
        catchError((error) => {
          console.error('Error fetching course modules:', error);
          return throwError(error);
        })
      );
  }

  public saveCourseModule(moduleData: Module, courseId: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const requestData = {
      ...moduleData,
      course_id: courseId,
    };

    return this.http
      .post<any>(`${this.apiUrl}/save_course_module/`, requestData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error saving course module:', error);
          return throwError(error);
        })
      );
  }

  public deleteCourseModule(moduleId: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const requestData = { id: moduleId };

    return this.http
      .post<any>(`${this.apiUrl}/delete_course_module/`, requestData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error deleting course module:', error);
          return throwError(error);
        })
      );
  }
}

