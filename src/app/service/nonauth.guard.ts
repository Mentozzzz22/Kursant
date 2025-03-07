import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(): Observable<boolean> {
    if (this.userService.isLoggedIn()) {
      return this.userService.verify().pipe(
        map(response => {
          const userRole = this.userService.getRole();
          switch (userRole) {
            case 'learner':
              this.router.navigate(['/student/courses']);
              break;
            case 'sales':
              this.router.navigate(['/sales/application-sales']);
              break;
            case 'employee':
              this.router.navigate(['/admin/course']);
              break;
            case 'curator':
              this.router.navigate(['/curator/curator-homework']);
              break;
            default:
              this.router.navigate(['/login']);
              break;
          }
          return false;
        }),
        catchError(error => {
          if (error?.detail === 'Invalid token.') {
            console.log('Invalid token, allowing access as non-authenticated user.');
            return of(true);
          } else {
            this.router.navigate(['/login']);
            return of(false);
          }
        })
      );
    }
    return of(true);
  }
}
