import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {UserService} from "./user.service";
import {catchError, Observable, throwError} from "rxjs";
import {GetModules} from "../../assets/models/getModules.interface";
import {Module} from "../../assets/models/module.interface";
import {GetTopic} from "../../assets/models/getTopics.interface";
import {Topic} from "../../assets/models/topic.interface";

@Injectable({
  providedIn: 'root'
})
export class TopicService {

  private apiUrl = 'http://127.0.0.1:8000/api/course';
  private http = inject(HttpClient);
  private userService = inject(UserService);

  public getTopics(moduleId: number): Observable<GetTopic> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('module_id', moduleId.toString());

    return this.http
      .get<GetTopic>(`${this.apiUrl}/get_module_topics/`, { headers, params })
      .pipe(
        catchError((error) => {
          console.error('Error fetching course modules:', error);
          return throwError(error);
        })
      );
  }

  public saveTopic(topicData: Topic, moduleId: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const requestData = {
      ...topicData,
      module_id: moduleId,
    };

    return this.http
      .post<any>(`${this.apiUrl}/save_topic/`, requestData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error saving course module:', error);
          return throwError(error);
        })
      );
  }

  public deleteTopic(topicId: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const requestData = { id: topicId };

    return this.http
      .post<any>(`${this.apiUrl}/delete_module_topic/`, requestData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error deleting course module:', error);
          return throwError(error);
        })
      );
  }
}

