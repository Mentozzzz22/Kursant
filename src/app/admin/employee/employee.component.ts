import {Component, inject, OnInit} from '@angular/core';
import {EmployeeService} from "../../service/employee.service";
import {Employee} from "../../../assets/models/employee.interface";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {NgForOf, NgIf} from "@angular/common";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {PaginatorModule} from "primeng/paginator";
import {MessageService, PrimeTemplate} from "primeng/api";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {TableModule} from "primeng/table";
import {CheckboxModule} from "primeng/checkbox";
import {MultiSelectModule} from "primeng/multiselect";
import {NgxMaskDirective} from "ngx-mask";

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    DialogModule,
    DropdownModule,
    NgForOf,
    NgIf,
    OverlayPanelModule,
    PaginatorModule,
    PrimeTemplate,
    ReactiveFormsModule,
    TableModule,
    CheckboxModule,
    MultiSelectModule,
    NgxMaskDirective
  ],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  public permissions: boolean[] = [];
  employees: Employee[] = [];
  searchText: string = '';
  visible: boolean = false;
  visibleShow: boolean = false;
  public selectedEmployee: Employee | null = null;

  public availableAccesses: any[] = [
    {label: 'Сотрудники', value: 'employee'},
    {label: 'Запросы на доступ', value: 'admin_order'},
    {label: 'Заявки на курсы', value: 'sales_manager_order'},
    {label: 'Ученики', value: 'learner'},
    {label: 'Курсы', value: 'course'},
    {label: 'Кураторы', value: 'curator'},
  ];

  ngOnInit(): void {
    this.getEmployees()
  }

  searchEmployees() {
    this.getEmployees(this.searchText);
  }

  getEmployees(search: string = '') {
    this.employeeService.getEmployees(search).subscribe(data => {
      this.employees = data;
    });
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


  public employeeForm = this.fb.group({
    fullname: ['', Validators.required],
    phone_number: ['', Validators.required],
    job_title: ['', Validators.required],
    is_active: [true, Validators.required],
    permissions: [[] as string[], Validators.required]
  });

  public employeeUpdateForm = this.fb.group({
    fullname: ['', Validators.required],
    phone_number: ['',  Validators.required],
    job_title: ['',  Validators.required],
    is_active: [true,  Validators.required],
    permissions: [[] as string[],  Validators.required]
  });

  onSubmit(): void {
    if(this.employeeForm.invalid) {
      this.messageService.add({
        severity: 'warn', summary: 'Ошибка', detail: `Заполните все поля`
      })
    } else {

      let phone = this.employeeForm.value.phone_number || '';

      if (phone) {
        phone = phone.replace(/\D/g, '');
        phone = `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`;
      }

      const employeeData: Employee = {
        id: this.selectedEmployee?.id,
        fullname: this.employeeForm.value.fullname || '',
        phone_number: phone || '',
        job_title: this.employeeForm.value.job_title || '',
        is_active: this.employeeForm.value.is_active ?? true,
        permissions: this.employeeForm.value.permissions || []
      };

      this.employeeService.saveEmployee(employeeData).subscribe(
        response => {

          this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Сотрудник успешно создан'});

          this.visible = false;
          this.employeeForm.reset();
          this.employeeForm.patchValue({ is_active: true });
          this.getEmployees();
        },
        error => {
          if (error.status === 409) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Конфликт',
              detail: 'Сотрудник с таким номером телефона уже существует'
            });
          } else if (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 404 || error.status === 500) {
            this.messageService.add({
              severity: 'error',
              summary: 'Ошибка',
              detail: `Ошибка на стороне сервера (${error.status})`
            });
          } else {
            this.messageService.add({severity: 'error', summary: 'Неизвестная ошибка', detail: 'Что-то пошло не так'});
          }
        }
      );
    }
  }

  onUpdate(): void {
    if (this.employeeUpdateForm.invalid) {
      this.messageService.add({
        severity: 'warn', summary: 'Ошибка', detail: `Заполните все поля`
      })
    } else {

      let phone = this.employeeUpdateForm.value.phone_number || '';

      if (phone) {
        phone = phone.replace(/\D/g, '');
        phone = `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`;
      }

      const employeeData: Employee = {
        id: this.selectedEmployee?.id,
        fullname: this.employeeUpdateForm.value.fullname || '',
        phone_number: phone || '',
        job_title: this.employeeUpdateForm.value.job_title || '',
        is_active: this.employeeUpdateForm.value.is_active ?? true,
        permissions: this.employeeUpdateForm.value.permissions || []
      };

      this.employeeService.saveEmployee(employeeData).subscribe(
        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Данные сотрудника успешно обновлены'
          });
          this.visibleShow = false;
          this.getEmployees();
        },
        error => {
          if (error.status === 409) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Конфликт',
              detail: 'Сотрудник с таким номером телефона уже существует'
            });
          } else if (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 404 || error.status === 500) {
            this.messageService.add({
              severity: 'error',
              summary: 'Ошибка',
              detail: `Ошибка на стороне сервера (${error.status})`
            });
          } else {
            this.messageService.add({severity: 'error', summary: 'Неизвестная ошибка', detail: 'Что-то пошло не так'});
          }
        }
      );
    }
  }


  getEmployeeById(employeeId: number): void {
    this.employeeService.getEmployeeById(employeeId).subscribe(
      (employee: Employee) => {
        this.employeeUpdateForm.patchValue({
          fullname: employee.fullname || '',
          phone_number: employee.phone_number || '',
          job_title: employee.job_title || '',
          is_active: employee.is_active ?? true,
          permissions: employee.permissions || []
        });

        this.selectedEmployee = employee;
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

  public deleteEmployee(): void {
    const employeeId = this.selectedEmployee?.id
    console.log(employeeId)
    if (employeeId) {
      this.employeeService.deleteEmployee(employeeId).subscribe(
        response => {
          this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Пользователь успешно удален'});
          this.getEmployees();
          this.visibleShow = false;
        },
        error => {
          if (error.status === 409) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Ошибка',
              detail: 'Нельзя удалить данного пользователя'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Ошибка',
              detail: 'Произошла ошибка при удалении пользователя'
            });
          }
        }

      );
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Внимание',
        detail: 'Не удалось определить пользователя для удаления'
      });
    }
  }


  closeDialog() {
    this.visible = false;
  }


}
