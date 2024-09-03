import {Component, inject} from '@angular/core';
import {SidebarModule} from "primeng/sidebar";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Button, ButtonModule} from "primeng/button";
import {RouterModule, Router} from "@angular/router";

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [RouterModule, ButtonModule, SidebarModule, NgForOf, NgClass, NgIf],
  templateUrl: './student-sidebar.component.html',
  styleUrl: './student-sidebar.component.css'
})
export class StudentSidebarComponent {
  private router = inject(Router)

  isExpanded: boolean = false;

  menuItems = [
    { name: 'Курстар', link: '/courses', icon: 'assets/images/courses-icon.svg' },
    { name: 'Үй жұмысы', link: '/homework', icon: 'assets/images/dz-icon.svg' },
    { name: 'Календарь', link: '/calendar', icon: 'assets/images/calendar-icon.svg' },
    { name: 'Хабарламалар', link: '/notifications', icon: 'assets/images/notification-icon.svg' },
    { name: 'Бағалар', link: '/grades', icon: 'assets/images/grades-icon.svg' },
  ];

  toggleExpand(expand: boolean) {
    this.isExpanded = expand;
  }

  navigate(link: string) {
    this.router.navigate([link]);
  }
}
