import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ConfirmationService, MessageService, PrimeTemplate} from "primeng/api";
import {Employee} from "../../../assets/models/employee.interface";
import {ConfirmPopup, ConfirmPopupModule} from "primeng/confirmpopup";
import {Learner} from "../../../assets/models/learner.interface";
import {LearnerService} from "../../service/learner.service";
import {Button} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";
import {DialogModule} from "primeng/dialog";
import {NgForOf, NgIf} from "@angular/common";
import {NgxMaskDirective} from "ngx-mask";
import {PaginatorModule} from "primeng/paginator";
import {TableModule} from "primeng/table";
import {OrderService} from "../../service/order.service";
import {AutoCompleteModule} from "primeng/autocomplete";

@Component({
  selector: 'app-learner',
  standalone: true,
  imports: [
    Button,
    CheckboxModule,
    ConfirmPopupModule,
    DialogModule,
    NgIf,
    NgxMaskDirective,
    PaginatorModule,
    PrimeTemplate,
    ReactiveFormsModule,
    TableModule,
    AutoCompleteModule,
    NgForOf
  ],
  templateUrl: './learner.component.html',
  styleUrl: './learner.component.css'
})
export class LearnerComponent implements OnInit {
  private learnerService = inject(LearnerService);
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService)

  public learners: Learner[] = [];
  searchText: string = '';
  visible: boolean = false;
  visibleShow: boolean = false;
  public selectedCurator: Employee | null = null;
  public regions: any[] = [];
  public filteredRegions: string[] = [];


  @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;

  ngOnInit(): void {
    this.loadLeaner()
    this.loadRegions();

    this.learnerForm.get('region')?.valueChanges.subscribe(value => {
      this.onInput();
    });
  }

  searchCurator() {
    this.loadLeaner(this.searchText);
  }

  loadLeaner(search: string = ''): void {
    this.learnerService.getLearner(search).subscribe({
      next: (data) => {
        this.learners = data
      },
      error: (err) => console.error('Error loading curators:', err)
    });
  }


  loadRegions(): void {
    this.orderService.getRegions().subscribe(data => {
      this.regions = data;
    });
  }

  onInput(): void {
    const query = this.learnerForm.get('region')?.value?.toLowerCase() || '';

    this.filteredRegions = this.regions.filter(region =>
      region.toLowerCase().startsWith(query)
    );
  }


  selectRegion(region: string): void {
    this.learnerForm.get('region')?.setValue(region);
    this.filteredRegions = [];
  }


  get isVisible(): boolean {
    return this.visible || this.visibleShow;
  }


  set isVisible(value: boolean) {
    if (this.visible) {
      this.visible = value;
    } else if (this.visibleShow) {
      this.visibleShow = value;
    }
  }

  showDialog() {
    this.visible = true;
  }


  public learnerForm = this.fb.group({
    fullname: ['', Validators.required],
    phone_number: ['', Validators.required],
    region: ['', Validators.required],
    is_active: [true, Validators.required]
  });

  public learnerUpdateForm = this.fb.group({
    fullname: ['', Validators.required],
    phone_number: ['', Validators.required],
    region: ['', Validators.required],
    is_active: [true, Validators.required]
  });

  onSubmit(): void {
    if (this.learnerForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка',
        detail: `Заполните все поля`
      });
    } else {
      let phone = this.learnerForm.value.phone_number || '';
      // if (!/^7\d{9}$/.test(phone)) {
      //   this.messageService.add({
      //     severity: 'warn',
      //     summary: 'Ошибка в номере телефона',
      //     detail: 'Номер телефона должен начинаться с 7 и содержать 10 цифр'
      //   });
      //   return;
      // }


      if (phone) {
        phone = phone.replace(/\D/g, '');
        phone = `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`;
      }
      const learnerData: Learner = {
        id: this.selectedCurator?.id,
        fullname: this.learnerForm.value.fullname || '',
        phone_number: formattedPhone || '',
        region: this.learnerForm.value.region || '',
        is_active: this.learnerForm.value.is_active ?? true
      };

      this.learnerService.saveLeaner(learnerData).subscribe(
        response => {

          this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Ученик успешно создан'});

          this.visible = false;
          this.learnerForm.reset()
          this.learnerForm.patchValue({ is_active: true });
          this.loadLeaner();
        },
        error => {
          if (error.status === 409) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Конфликт',
              detail: 'Ученик с таким номером телефона уже существует'
            });
          } else if (error.status === 400) {
            this.messageService.add({
              severity: 'error',
              summary: 'Ошибка в данных',
              detail: 'Некоторые данные формы неверны. Пожалуйста, проверьте введенные данные и попробуйте снова.'
            });
          } else if (error.status === 401 || error.status === 403 || error.status === 404 || error.status === 500) {
            this.messageService.add({
              severity: 'error',
              summary: 'Ошибка',
              detail: `Ошибка на стороне сервера (${error.status})`
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Неизвестная ошибка',
              detail: 'Что-то пошло не так'
            });
          }
        }
      );
    }
  }

  onUpdate(): void {
    if (this.learnerUpdateForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка',
        detail: `Заполните все поля`
      });
    } else {
      let phone = this.learnerUpdateForm.value.phone_number || '';

      phone = phone.replace(/\D/g, '');

      if (phone.length === 10) {
        phone = `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`;
      } else if (phone.length === 11 && phone.startsWith('7')) {
        phone = `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Ошибка',
          detail: 'Неверный формат номера телефона'
        });
        return;
      }
      console.log(phone);

      const learnerData: Learner = {
        id: this.selectedCurator?.id,
        fullname: this.learnerUpdateForm.value.fullname || '',
        phone_number: formattedPhone || '',
        region: this.learnerForm.value.region || '',
        is_active: this.learnerUpdateForm.value.is_active ?? true
      };

      this.learnerService.saveLeaner(learnerData).subscribe(
        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Данные ученика успешно обновлены'
          });
          this.visibleShow = false;
          this.loadLeaner();
        },
        error => {
          if (error.status === 409) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Конфликт',
              detail: 'Ученик с таким номером телефона уже существует'
            });
          } else if (error.status === 400) {
            this.messageService.add({
              severity: 'error',
              summary: 'Ошибка в данных',
              detail: 'Некоторые данные формы неверны. Пожалуйста, проверьте введенные данные и попробуйте снова.'
            });
          } else if (error.status === 401 || error.status === 403 || error.status === 404 || error.status === 500) {
            this.messageService.add({
              severity: 'error',
              summary: 'Ошибка',
              detail: `Ошибка на стороне сервера (${error.status})`
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Неизвестная ошибка',
              detail: 'Что-то пошло не так'
            });
          }
        }
      );
    }
  }


  getCuratorById(learnerId: number): void {
    this.learnerService.getLeanerById(learnerId).subscribe(
      (leaner: Learner) => {
        this.learnerUpdateForm.patchValue({
          fullname: leaner.fullname || '',
          phone_number: leaner.phone_number || '',
          region: leaner.region || '',
          is_active: leaner.is_active ?? true
        });

        this.selectedCurator = leaner;
        this.visibleShow = true;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось загрузить данные сотрудника'
        });
      }
    );
  }

  deleteEmployee(): void {
    const learnerId = this.selectedCurator?.id
    if (learnerId) {
      this.learnerService.deleteLearner(learnerId).subscribe(
        response => {
          this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Ученик успешно удален'});
          this.visibleShow = false;
          this.loadLeaner();
        },
        error => {
          if (error.status === 409) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Ошибка',
              detail: 'Нельзя удалить данного ученика'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Ошибка',
              detail: 'Произошла ошибка при удалении ученика'
            });
          }
        }
      );
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Внимание',
        detail: 'Не удалось определить ученика для удаления'
      });
    }
  }


  reject() {
    this.confirmPopup.reject();
  }

  confirm(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      accept: () => {
        this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Ученик удален'});
      },
      reject: () => {
        this.messageService.add({severity: 'info', summary: 'Отмена', detail: 'Вы отклонили'});
      }
    });
  }

  closeDialog() {
    this.visible = false;
  }


}

