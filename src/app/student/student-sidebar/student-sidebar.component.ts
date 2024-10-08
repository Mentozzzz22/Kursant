import {Component, EventEmitter, inject, Output} from '@angular/core';
import {SidebarModule} from "primeng/sidebar";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Button, ButtonModule} from "primeng/button";
import {RouterModule, Router} from "@angular/router";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [RouterModule, ButtonModule, SidebarModule, NgForOf, NgClass, NgIf],
  templateUrl: './student-sidebar.component.html',
  styleUrl: './student-sidebar.component.css'
})
export class StudentSidebarComponent {
  private router = inject(Router);
  private userService = inject(UserService);
  @Output() sidebarToggled = new EventEmitter<boolean>();
  activeItem: string = '';
  isExpanded: boolean = false;
  isMobileSidebarOpen: boolean = false;

  menuItems = [
    { name: 'Курстар', link: '/student/courses', icon: 'assets/images/cap_icon.svg' },
    { name: 'Үй жұмысы', link: '/student/homework-list', icon: 'assets/images/dz-icon.svg' },
    { name: 'Календарь', link: '/student/calendar', icon: 'assets/images/calendar-icon.svg' },
    { name: 'Хабарламалар', link: '/student/notifications', icon: 'assets/images/notification-icon.svg' },
    { name: 'Бағалар', link: '/student/grades', icon: 'assets/images/grades-icon.svg' },
  ];

  toggleExpand(expand: boolean) {
    if (window.innerWidth > 768) {
      this.isExpanded = expand;
      this.sidebarToggled.emit(this.isExpanded);
    }
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }



  navigate(link: string) {
    if (link === '/logout') {
      this.userService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Ошибка при выходе:', error);
        }
      });
    } else {
      this.activeItem = link;
      this.router.navigate([link]);
    }
    this.isMobileSidebarOpen = false;
  }
}
