import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from './user.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private userService = inject(UserService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRole = route.data['role'];



    if (this.userService.isLoggedIn()) {
      return this.userService.verify().pipe(
        map(response => {
          const userRole = this.userService.getRole();
          if (response.verified && userRole && userRole === expectedRole) {
            return true;
          } else {
            this.router.navigate(['/access-denied']);
            return false;
          }
        }),
        catchError(error => {
          this.router.navigate(['/access-denied']);
          return of(false);
        })
      );
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
