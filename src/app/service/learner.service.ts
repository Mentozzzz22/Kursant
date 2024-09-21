import {inject, Injectable} from '@angular/core';
import {UserService} from "./user.service";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Learner} from "../../assets/models/learner.interface";
import {CuratorInterface} from "../../assets/models/curator.interface";

@Injectable({
  providedIn: 'root'
})
export class LearnerService {
  private apiUrl = 'http://127.0.0.1:8000/api/learner';
  private userService = inject(UserService);
  private http = inject(HttpClient)

  constructor() { }

  public getLearner(search?: string): Observable<Learner[]> {
    let params: any = {};
    if (search) {
      params.search = search;
    }

    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.get<Learner[]>(`${this.apiUrl}/get_learners/`, {headers, params });
  }

  public saveLeaner(learnerData: Learner): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post<any>(`${this.apiUrl}/save_learner/`, learnerData, { headers });
  }

  public getLeanerById(id: number): Observable<Learner> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const params = new HttpParams().set('id', id.toString());

    return this.http.get<Learner>(`${this.apiUrl}/get_learner/`, { headers, params });
  }

  deleteLearner(id: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post<any>(`${this.apiUrl}/delete_learner/`, { id }, { headers });
  }

}
