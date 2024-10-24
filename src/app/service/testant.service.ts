import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TestantService {
  private apiUrl = environment.apiUrl + '/api/testant';
  private userService = inject(UserService);
  private http = inject(HttpClient)

  constructor() { }

  public getTestants(flow_id: number,  search?: string): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    let params = new HttpParams()
      .set('flow_id', flow_id);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${this.apiUrl}/get_testants/`, { headers, params });
  }


  public getTestantForCurator(): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);


    return this.http.get<any>(`${this.apiUrl}/get_curator_testants/`, { headers});
  }

  public saveTestant(meetingData: any): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post<any>(`${this.apiUrl}/save_testant/`, meetingData, { headers }).pipe(
      catchError(error => {
        console.error('Save meeting failed:', error);
        return throwError(error);
      })
    );
  }

  public deleteTestant(testId: number | null): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const body = { id: testId };

    return this.http.post<any>(`${this.apiUrl}/delete_testant/`, body, { headers }).pipe(
      catchError(error => {
        console.error('Delete meeting failed:', error);
        return throwError(error);
      })
    );
  }
}
