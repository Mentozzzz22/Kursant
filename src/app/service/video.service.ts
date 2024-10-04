import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {UserService} from "./user.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = environment.apiUrl + '/api/learner_course/';
  private courseUrl = environment.apiUrl + '/api/course/free_lesson/';
  private http = inject(HttpClient);
  private userService = inject(UserService);
  constructor() { }

  getLessonVideoUrl(lesson_id: number, quality: number): string {
    const token = this.userService.token;
    const videoUrl = `${this.apiUrl}${token}/lesson/${lesson_id}/video/${quality}/`;
    return videoUrl;
  }

  getLessonFreeVideoUrl(course_id: number, quality: number): string {
    const videoUrl = `${this.courseUrl}${course_id}/video/${quality}/`;
    return videoUrl;
  }


  sendVideoTimeUpdate(startTime: number, endTime: number, lessonId:number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const body = {
      start_time: startTime,
      end_time: endTime ,
      learner_lesson_id: lessonId  };


    return this.http.post(`${this.apiUrl}save_progress/`, body, { headers });
  }

  checkProgress(lesson_id: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('learner_lesson_id', lesson_id.toString());


    return this.http.get(`${this.apiUrl}check_progress/`,{headers,params});
  }
}
