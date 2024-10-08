import {inject, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Learner} from "../../assets/models/learner.interface";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {UserService} from "./user.service";
import {Message} from "../../assets/models/message.interface";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = environment.apiUrl + '/api/notification';
  private userService = inject(UserService);
  private http = inject(HttpClient)

  public getMessages(search?: string): Observable<{total_count: number, messages: Message[]}> {
    let params: any = {};
    if (search) {
      params.search = search;
    }

    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.get<{total_count: number, messages: Message[]}>(`${this.apiUrl}/get_messages/`, {headers, params });
  }
}
