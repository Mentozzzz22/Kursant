import {inject, Injectable} from '@angular/core';
import {catchError, Observable, throwError} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {UserService} from "./user.service";
import {GetModules} from "../../assets/models/getModules.interface";

@Injectable({
  providedIn: 'root'
})
export class CuratorService {
  private jsonUrl = 'assets/demo-data/curator-homeworks.json';
  private apiUrl = 'http://127.0.0.1:8000/api/curator';
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
}

