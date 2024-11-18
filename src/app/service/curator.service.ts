import {inject, Injectable} from '@angular/core';
import {catchError, Observable, throwError} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {UserService} from "./user.service";
import {GetModules} from "../../assets/models/getModules.interface";
import {CuratorInterface} from "../../assets/models/curator.interface";
import {CuratorFlowsInterface} from "../../assets/models/curatorFlows.interface";
import {LearnersLessonProgress} from "../../assets/models/LearnersLessonProgress.interface";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CuratorService {
  private jsonUrl = 'assets/demo-data/curator-homeworks.json';
  private apiUrl = environment.apiUrl + '/api/curator';
  private learnerApiUrl = environment.apiUrl + '/api/learner_course';
  private userService = inject(UserService);
  private http = inject(HttpClient)
  constructor() { }

  getProgress(): Observable<any[]> {
    return this.http.get<any[]>(this.jsonUrl);
  }

  public getCurators(): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http
      .get<GetModules>(`${this.apiUrl}/get_curators/`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error fetching curators:', error);
          return throwError(error);
        })
      );
  }

  public getCuratorFlows(): Observable<CuratorFlowsInterface[]> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http
      .get<CuratorFlowsInterface[]>(`${this.apiUrl}/get_my_flows/`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error fetching curator flows:', error);
          return throwError(error);
        })
      );
  }

  public getCurator(search?: string): Observable<CuratorInterface[]> {
    let params: any = {};
    if (search) {
      params.search = search;
    }

    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.get<CuratorInterface[]>(`${this.apiUrl}/get_curators/`, {headers, params });
  }

  public saveCurator(curatorData: CuratorInterface): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post<any>(`${this.apiUrl}/save_curator/`, curatorData, { headers });
  }

  getCuratorById(id: number): Observable<CuratorInterface> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const params = new HttpParams().set('id', id.toString());

    return this.http.get<CuratorInterface>(`${this.apiUrl}/get_curator/`, { headers, params });
  }

  deleteCurator(id: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post<any>(`${this.apiUrl}/delete_curator/`, { id }, { headers });
  }

  getCuratorFlow(): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.get<any>(`${this.apiUrl}/get_my_flows/`, {headers });
  }

  getLearnersLessonProgress(flowId: number,search: string = ''): Observable<LearnersLessonProgress[]> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    let params = new HttpParams().set('flow_id', flowId.toString());
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<LearnersLessonProgress[]>(`${this.learnerApiUrl}/get_learners_lessons_progress/`, { headers, params });
  }

}

