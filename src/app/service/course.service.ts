import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Course} from "../../assets/models/course.interface";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://127.0.0.1:8000/api/course/';
  private http = inject(HttpClient)
  private searchTextSubject = new BehaviorSubject<string>('');
  constructor() { }


  getSearchText() {
    return this.searchTextSubject.asObservable();
  }

  setSearchText(searchText: string) {
    this.searchTextSubject.next(searchText);
  }
  getCourses(search?: string, ids?: number[]): Observable<Course[]> {
    let params: any = {};

    if (search) {
      params.search = search;
    }

    if (ids && ids.length > 0) {
      params.ids = JSON.stringify(ids);
    }


    return this.http.get<Course[]>(`${this.apiUrl}get_courses/`, { params });
  }
}
