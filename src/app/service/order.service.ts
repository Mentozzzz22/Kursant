import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://127.0.0.1:8000/api/order/';
  private http = inject(HttpClient)
  private cartCount = new BehaviorSubject<number>(this.getCartCountFromLocalStorage());

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
}
