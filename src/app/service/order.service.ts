import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {SalesApplication} from "../../assets/models/salesApplication.interface";
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://127.0.0.1:8000/api/order/';
  private http = inject(HttpClient)
  private cartCount = new BehaviorSubject<number>(this.getCartCountFromLocalStorage());
  private userService = inject(UserService);

  constructor() { }

  private getCartCountFromLocalStorage(): number {
    const storedCount = localStorage.getItem('cartCount');
    const count = storedCount ? parseInt(storedCount, 10) : 0;
    return count;
  }

  updateCartCount(count: number) {
    this.cartCount.next(count);
    localStorage.setItem('cartCount', count.toString());
  }

  getCartCount(): Observable<number> {
    return this.cartCount.asObservable();
  }
  makeOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}make_order/`, orderData);
  }

  getApplications(status: string = '', search: string = '', limit: number = 20, offset: number = 0): Observable<{
    total_count: number,
    orders: SalesApplication[]
  }>  {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (status) {
      params = params.set('status', status);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ total_count: number, orders: SalesApplication[] }>(`${this.apiUrl}get_sales_manager_orders/`, { headers, params });
  }


  getApplicationById(id: number): Observable<SalesApplication> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const params = new HttpParams().set('order_id', id.toString());

    return this.http.get<SalesApplication>(`${this.apiUrl}get_sales_manager_order/`, { headers, params });
  }


  acceptSalesManagerOrder(formData: FormData): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post(`${this.apiUrl}accept_sales_manager_order/`, formData, { headers });
  }

  cancelSalesManagerOrder(payload: any): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post(`${this.apiUrl}reject_sales_manager_order/`, payload, { headers });
  }




}
