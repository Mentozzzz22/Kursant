import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {UserService} from "../service/user.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-sales',
  standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        RouterOutlet
    ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit{
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  fullname: string | null = '';


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

  ngOnInit(): void {
    this.fullname = this.userService.getFullName();
  }
}
