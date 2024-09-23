import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    if (this.userService.isLoggedIn()) {
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
          console.error('Неизвестная роль пользователя:', userRole);
          this.router.navigate(['/login']);
          break;
      }
      return false;
    }
    return true;
  }
}
