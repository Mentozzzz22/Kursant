import {inject, Injectable} from '@angular/core';
import {catchError, Observable, throwError} from "rxjs";
import {GetTopic} from "../../assets/models/getTopics.interface";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {UserService} from "./user.service";
import {Course} from "../../assets/models/course.interface";
import {GetFlows} from "../../assets/models/getFlows.interface";
import {GetFlow} from "../../assets/models/getFlow.interface";
import {GetDeadlines} from "../../assets/models/getDeadlines.interface";
import {tap} from "rxjs/operators";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FlowService {
  private apiUrl = environment.apiUrl + '/api/flow';
  private http = inject(HttpClient);
  private userService = inject(UserService);


  public getFlows(search?: string): Observable<GetFlows[]> {
    let params: any = {};
    if (search) {
      params.search = search;
    }
    return this.http.get<GetFlows[]>(`${this.apiUrl}/get_flows/`, {params});
  }

  public getFlow(id: number): Observable<GetFlow> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('flow_id', id.toString());

    return this.http.get<GetFlow>(`${this.apiUrl}/get_flow/`,
      {headers, params}
    );
  }

  public saveFlow(flowData: any): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post(`${this.apiUrl}/save_flow/`, flowData, {headers}).pipe(
      catchError(error => {
        console.error('Save flow failed:', error);
        return throwError(error);
      })
    );
  }

  public deleteFlow(flowId: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post<any>(`${this.apiUrl}/delete_flow/`, {flow_id: flowId},
      {headers}
    )
      .pipe(
        catchError((error) => {
          console.error('Error deleting course:', error);
          return throwError(error);
        })
      )
  }


  public addCuratorToCourse(data: { flow_course_id: number; curator_id: number }): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.userService.token}`);
    return this.http.post(`${this.apiUrl}/add_curator/`, data, {headers});
  }

  public removeCuratorFromCourse(curatorId: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    console.log(curatorId)

    return this.http.post(`${this.apiUrl}/remove_curator/`, {flow_curator_id: curatorId}, {headers});
  }

  public getCourseDeadlines(flowCourseId: number): Observable<GetDeadlines> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    return this.http.get<GetDeadlines>(`${this.apiUrl}/get_course_deadlines/`, {
      headers,
      params: new HttpParams().set('flow_course_id', flowCourseId)
    });
  }

  public saveCourseDeadlines(data: any): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    return this.http.post(`${this.apiUrl}/save_course_deadlines/`, data, {headers});
  }
}
