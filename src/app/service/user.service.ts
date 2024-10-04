import {inject, Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {BehaviorSubject, catchError, Observable, throwError} from "rxjs";
import {tap} from "rxjs/operators";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {

  private http = inject(HttpClient);
  private userUrl = environment.apiUrl + '/api/user/';
  private role: string | null = null;
  token: string | null = null;
  phone:string|null = null;

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
    this.phone = localStorage.getItem('phone');
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

    return this.http.post<any>(`${this.userUrl}logout/`, {}, {headers}).pipe(
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


  getFullName(): string | null {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.fullname;
    }
    return null;
  }
  verify(): Observable<any> {
    if (!this.token || !this.role) {
      return throwError({ status: 403, detail: 'Invalid token.' });
    }

    const headers = new HttpHeaders({
      'Authorization': `Token ${this.token}`
    });

    // Send the token and role as query parameters
    const params = new HttpParams()
      .set('token', this.token)
      .set('role', this.role);

    return this.http.get<any>(`${this.userUrl}verify/`, { headers, params }).pipe(
      tap(response => {
        if (response.verified) {
          const userData = response.user_data;
          if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData));
          }
        }
      }),
      catchError(error => {
        console.error('Verification error:', error);
        return throwError(error);
      })
    );
  }


}
