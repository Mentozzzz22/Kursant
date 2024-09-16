import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../service/user.service";
import {NgIf} from "@angular/common";
import {NgxMaskDirective} from "ngx-mask";
import {MessageService} from "primeng/api";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgxMaskDirective
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  public loginSuccess: boolean = false;
  public isCodeValid: boolean | null = null;

  public loginForm = this.fb.group({
    phone: ['', Validators.required]
  });

  public smsCode = this.fb.group({
    sms: ['', Validators.required]
  });

  ngOnInit(): void {
  }

  sendCode() {
    let phone = this.loginForm.get('phone')?.value;

    if (phone) {
      // Приводим номер к нужному формату
      phone = phone.replace(/\D/g, ''); // Убираем все символы, кроме цифр
      phone = `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`;
    }

    if (this.loginForm.valid) {
      this.userService.sendSms(phone).subscribe(
        (response) => {
          console.log('SMS отправлено успешно', response);
          this.loginSuccess = true;
          this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Смс отправлено'});
        },
        (error) => {
          this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Пользователь не найден'});
        }
      );
    } else {
      console.error('Неверный формат номера телефона');
    }
  }


  checkSmsCode() {
    let phone = this.loginForm.get('phone')?.value;

    if (phone) {
      // Приводим номер к нужному формату
      phone = phone.replace(/\D/g, '');
      phone = `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`;
    }

    const code = this.smsCode.get('sms')?.value;

    if (this.smsCode.valid) {
      this.userService.checkSmsCode(phone, code).subscribe(
        (response) => {
          console.log('Код успешно проверен', response);
          this.isCodeValid = true;
          this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Успешно авторизован'});
          this.router.navigate(['/student']);
        },
        (error) => {
          console.error('Ошибка проверки кода', error);
          if (error.status === 401) {
            if (error.error.detail === "Code not found" || error.error.detail === "User not found") {
              console.error('Код или пользователь не найден');
            }
          } else if (error.status === 403) {
            console.error('У пользователя нет роли');
          }
          this.isCodeValid = false;
        }
      );
    } else {
      console.error('Неверный SMS-код');
    }
  }
}
