import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private jsonUrl = 'assets/demo-data/applications.json';
  private http = inject(HttpClient)
  constructor() { }

  getApplications(): Observable<any[]> {
    return this.http.get<any[]>(this.jsonUrl);
  }
}
