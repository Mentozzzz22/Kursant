import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {UserService} from "./user.service";
import {LearnerCourses, OtherCourses} from "../../assets/models/learner_courses.interface";
import {LearnerCourse, LearnerLessons} from "../../assets/models/learner_course.interface";
import {LearnerLesson} from "../../assets/models/learner_lesson.interface";

@Injectable({
  providedIn: 'root'
})
export class LearnerCourseService {

  private apiUrl = 'http://127.0.0.1:8000/api/learner_course';
  private courseUrl = 'http://127.0.0.1:8000/api/course';
  private userService = inject(UserService);
  private http = inject(HttpClient)


  // Получение курсов ученика
  public getCourses(): Observable<{ learner_courses: LearnerCourses[]; other_courses: OtherCourses[] }> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.get<{ learner_courses: LearnerCourses[]; other_courses: OtherCourses[] }>(`${this.apiUrl}/get_courses/`, { headers });
  }


  // Получение конкретного курса ученика
  public getCourse(learnerCourseId: number): Observable<LearnerCourse> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const params = {learner_course_id: learnerCourseId};
    return this.http.get<LearnerCourse>(`${this.apiUrl}/get_course/`, {headers, params});
  }

  // Получение урока ученика
  public getLesson(learnerLessonId: number): Observable<LearnerLesson> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const params = {learner_lesson_id: learnerLessonId};

    return this.http.get<LearnerLesson>(`${this.apiUrl}/get_lesson/`, {headers, params});
  }

  public getLessonFree(course_Id: number): Observable<LearnerLesson> {

    const params = {course_id: course_Id};
    return this.http.get<LearnerLesson>(`${this.courseUrl}/get_free_lesson/`, { params});
  }
}
