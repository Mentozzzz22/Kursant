import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {UserService} from "./user.service";
import {Observable} from "rxjs";
import {FlowTest} from "../../assets/models/curatorTestWork.interface";
import {LearnerHomework} from "../../assets/models/curatorLearnerHomeWork.interface";
import {LearnerTest} from "../../assets/models/curatorLearnerTest.interface";

@Injectable({
  providedIn: 'root'
})
export class LearnerTestService {
  private apiUrl = 'http://127.0.0.1:8000/api/learner_test';
  private http = inject(HttpClient);
  private userService = inject(UserService);

  constructor() { }

  public getFlowTestWorks(id: number,search: string = '',): Observable<FlowTest[]> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    let params = new HttpParams().set('flow_id', id.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<FlowTest[]>(`${this.apiUrl}/get_flow_tests/`, {headers, params}
    );
  }

  public getTestName(id: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('flow_test_id', id.toString());

    return this.http.get<any>(`${this.apiUrl}/get_topic_test/`, {headers, params });
  }

  public getLearnerTestDetails(status: string = '', id: number): Observable<LearnerTest[]> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    let params = new HttpParams().set('flow_test_id', id.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<LearnerTest[]>(`${this.apiUrl}/get_learner_tests/`, { headers, params });
  }


}
