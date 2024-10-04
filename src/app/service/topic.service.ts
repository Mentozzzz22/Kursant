import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {UserService} from "./user.service";
import {catchError, Observable, Subject, throwError} from "rxjs";
import {GetModules} from "../../assets/models/getModules.interface";
import {Module} from "../../assets/models/module.interface";
import {GetTopic} from "../../assets/models/getTopics.interface";
import {Topic} from "../../assets/models/topic.interface";
import {GetTopicContent} from "../../assets/models/getTopicContent.interface";
import {tap} from "rxjs/operators";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TopicService {

  private apiUrl = environment.apiUrl + '/api/course';
  private http = inject(HttpClient);
  private userService = inject(UserService);

  private topicUpdatedSource = new Subject<void>();
  topicUpdated$ = this.topicUpdatedSource.asObservable();

  public getTopics(moduleId: number): Observable<GetTopic> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('module_id', moduleId.toString());

    return this.http
      .get<GetTopic>(`${this.apiUrl}/get_module_topics/`, {headers, params})
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
      .post<any>(`${this.apiUrl}/save_topic/`, requestData, {headers})
      .pipe(
        catchError((error) => {
          console.error('Error saving course module:', error);
          return throwError(error);
        })
      );
  }

  private notifyTopicUpdated() {
    this.topicUpdatedSource.next();
  }


  public deleteTopic(topicId: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const requestData = {id: topicId};

    return this.http
      .post<any>(`${this.apiUrl}/delete_module_topic/`, requestData, {headers})
      .pipe(
        catchError((error) => {
          console.error('Error deleting module topic:', error);
          return throwError(error);
        }),
        tap(() => {
          // Уведомляем об обновлении списка тем после удаления
          this.notifyTopicUpdated();
        })
      );
  }

  getTopicContent(topicId: number): Observable<GetTopicContent> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('id', topicId.toString());
    return this.http
      .get<GetTopicContent>(`${this.apiUrl}/get_topic_content/`, {headers, params})
      .pipe(
        catchError((error) => {
          console.error('Error fetching module topics:', error);
          return throwError(error);
        })
      );
  }

  saveTopicContent(topicData: FormData): Observable<any> {
    const token = this.userService.token;

    // Установка только заголовка Authorization, Content-Type не устанавливаем вручную для FormData
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http
      .post<any>(`${this.apiUrl}/save_topic_content/`, topicData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error saving topic content:', error);
          return throwError(error); // Возвращаем поток с ошибкой
        })
      );
  }

}

