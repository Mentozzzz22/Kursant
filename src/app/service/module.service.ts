import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {UserService} from "./user.service";
import {catchError, Observable, Subject, throwError} from "rxjs";
import {GetModules} from "../../assets/models/getModules.interface";
import {Module} from "../../assets/models/module.interface";
import {tap} from "rxjs/operators";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private apiUrl = environment.apiUrl + '/api/course';
  private http = inject(HttpClient);
  private userService = inject(UserService);

  private moduleUpdatedSource = new Subject<void>();
  moduleUpdated$ = this.moduleUpdatedSource.asObservable();

  public getCourseModules(courseId: number): Observable<GetModules> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('course_id', courseId.toString());

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

  private notifyModuleUpdated() {
    this.moduleUpdatedSource.next();
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
        }),
        tap(() => {
          // Уведомляем об обновлении списка тем после удаления
          this.notifyModuleUpdated();
        })
      );
  }
}

