import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Course} from "../../assets/models/course.interface";
import {Employee} from "../../assets/models/employee.interface";
import {UserService} from "./user.service";
import {SalesApplication} from "../../assets/models/salesApplication.interface";

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://127.0.0.1:8000/api/employee/';
  private http = inject(HttpClient);
  private userService = inject(UserService);

  constructor() { }

  public getEmployees(search?: string): Observable<Employee[]> {
    let params: any = {};
    if (search) {
      params.search = search;
    }

    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.get<Employee[]>(`${this.apiUrl}get_employees/`, {headers, params });
  }

  getEmployeeById(id: number): Observable<Employee> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const params = new HttpParams().set('id', id.toString());

    return this.http.get<Employee>(`${this.apiUrl}get_employee/`, { headers, params });
  }

  public saveEmployee(employeeData: Employee): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post<any>(`${this.apiUrl}save_employee/`, employeeData, { headers });
  }

  deleteEmployee(id: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post<any>(`${this.apiUrl}delete_employee/`, { id }, { headers });
  }
}
