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
    sms: ['', [Validators.required, Validators.pattern('[0-9]{6}')]]
  });

  ngOnInit(): void {
    // this.smsCode.get('sms')?.valueChanges.subscribe(() => {
    //   const smsControl = this.smsCode.get('sms');
    //   if (smsControl?.invalid && (smsControl.dirty || smsControl.touched)) {
    //     this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Введите корректный код' });
    //   }
    // });
  }

  sendCode() {
    let phone = this.loginForm.get('phone')?.value;

    if (phone) {
      phone = phone.replace(/\D/g, '');
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
    if (this.smsCode.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Введите корректный код' });
      return;
    }

    let phone = this.loginForm.get('phone')?.value;

    if (phone) {
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
          const userRole = response.role;
          console.log(userRole);
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
        },
        (error) => {
          console.error('Ошибка проверки кода', error);
          if (error.status === 401) {
            if (error.error.detail === "Code not found") {
              console.error('Код не найден');
              this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Код не найден'});
            } else if (error.error.detail === "User not found") {
              console.error('Пользователь не найден');
              this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Пользователь не найден'});
            }
          } else if (error.status === 403 && error.error.detail === "User has no role") {
            console.error('У пользователя нет роли');
            this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'У пользователя нет роли'});
          } else {
            console.error('Неизвестная ошибка', error);
          }
          this.isCodeValid = false;
        }
      );
    } else {
      console.error('Неверный SMS-код');
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  returnBack() {
    this.loginSuccess = false;
  }
}
