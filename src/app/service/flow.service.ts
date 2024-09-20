import {inject, Injectable} from '@angular/core';
import {catchError, Observable, throwError} from "rxjs";
import {GetTopic} from "../../assets/models/getTopics.interface";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {UserService} from "./user.service";
import {Course} from "../../assets/models/course.interface";
import {GetFlows} from "../../assets/models/getFlows.interface";
import {GetFlow} from "../../assets/models/getFlow.interface";

@Injectable({
  providedIn: 'root'
})
export class FlowService {
  private apiUrl = 'http://127.0.0.1:8000/api/flow';
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

  addCuratorToCourse(data: { flow_course_id: number; curator_id: number }): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.userService.token}`);
    return this.http.post(`${this.apiUrl}/add_curator/`, data, { headers });
  }

  removeCuratorFromCourse(curatorId: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    console.log(curatorId)

    return this.http.post(`${this.apiUrl}/remove_curator/`, { flow_curator_id: curatorId }, { headers });
  }
}
