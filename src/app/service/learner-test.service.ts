import {inject, Injectable} from '@angular/core';
import {UserService} from "./user.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class LearnerTestService {

  private apiUrl = 'http://127.0.0.1:8000/api/get_test';
  private userService = inject(UserService);
  private http = inject(HttpClient)
}
