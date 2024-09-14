import {inject, Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {
  private userUrl = 'http://127.0.0.1:8000/api/user/';
  private http = inject(HttpClient);

  constructor() {}

  ngOnInit(): void {}

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

    return this.http.post<any>(`${this.userUrl}check_code/`, body);
  }
}
