import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {Subscription} from "rxjs";
import {UserService} from "../service/user.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-curator',
  standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        RouterOutlet
    ],
  templateUrl: './curator.component.html',
  styleUrl: './curator.component.css'
})
export class CuratorComponent implements OnInit, OnDestroy {
  private routerSubscription!: Subscription;
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  isHomeworkActive = false;
  fullname: string | null = '';

  constructor() {}

  ngOnInit(): void {

    this.fullname = this.userService.getFullName();

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHomeworkActive = event.url.startsWith('/curator/curator-homework') || event.url.startsWith('/curator/homework-detail') || event.url.startsWith('/curator/test-detail');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  logout() {
    this.userService.logout().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Вы успешно вышли из системы'
        });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Ошибка при выходе:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Ошибка при выходе из системы'
        });
      }
    });
  }
}
