import {inject, Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {BehaviorSubject, catchError, Observable, throwError} from "rxjs";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {

  private http = inject(HttpClient);
  private userUrl = 'http://127.0.0.1:8000/api/user/';
  private role: string | null = null;
  token: string | null = null;

  constructor() {
    this.loadAuthData();
  }

  ngOnInit(): void {
  }

  sendSms(phone: string | null | undefined): Observable<any> {
    const body = {
      phone_number: phone
    };
    return this.http.post<any>(`${this.userUrl}send_code/`, body);
  }

  checkSmsCode(phone: string | null | undefined, code: string | null | undefined): Observable<any> {
    const body = {
      phone_number: phone,
      code: code
    };
    return this.http.post<any>(`${this.userUrl}check_code/`, body).pipe(
      tap(response => {
        this.token = response.token;
        this.role = response.role;

        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
      }))
  }

  private loadAuthData(): void {
    this.token = localStorage.getItem('token');
    this.role = localStorage.getItem('role');
    const userData = localStorage.getItem('user_data');
    console.log('Loaded role:', this.role);
  }

  isLoggedIn(): boolean {
    return this.token !== null;
  }

  getRole(): string | null {
    return this.role;
  }

  logout(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Token ${this.token}`
    });

    return this.http.post<any>(`${this.userUrl}/user/logout/`, {}, {headers}).pipe(
      tap(response => {
        if (response.success) {
          this.clearAuthData()
        }
      }),
      catchError(error => {
        console.error('Logout failed:', error);
        return throwError(error);
      })
    );
  }

  clearAuthData(): void {
    this.token = null;
    this.role = null;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }
}
