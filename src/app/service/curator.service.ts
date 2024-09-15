import {inject, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CuratorService {
  private jsonUrl = 'assets/demo-data/curator-homeworks.json';
  private http = inject(HttpClient)
  constructor() { }

  getProgress(): Observable<any[]> {
    return this.http.get<any[]>(this.jsonUrl);
  }
}

