import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {ButtonDirective} from "primeng/button";
import {Ripple} from "primeng/ripple";
import {UserService} from "../service/user.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterOutlet,
    ButtonDirective,
    RouterLink,
    RouterLinkActive,
    Ripple
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit{
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  fullname: string | null = '';

  ngOnInit(): void {
    this.fullname = this.userService.getFullName();
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
