import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {CheckboxModule} from "primeng/checkbox";
import {DialogModule} from "primeng/dialog";
import {MultiSelectModule} from "primeng/multiselect";
import {NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {ConfirmationService, MessageService, PrimeTemplate} from "primeng/api";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {TableModule} from "primeng/table";
import {EmployeeService} from "../../service/employee.service";
import {Employee} from "../../../assets/models/employee.interface";
import {CuratorService} from "../../service/curator.service";
import {Curator} from "../../../assets/models/getFlow.interface";
import {CuratorInterface} from "../../../assets/models/curator.interface";
import {NgxMaskDirective} from "ngx-mask";
import {ConfirmPopup, ConfirmPopupModule} from "primeng/confirmpopup";
import {Button} from "primeng/button";

@Component({
  selector: 'app-curator-add',
  standalone: true,
  imports: [
    CheckboxModule,
    DialogModule,
    MultiSelectModule,
    NgIf,
    PaginatorModule,
    PrimeTemplate,
    ReactiveFormsModule,
    TableModule,
    NgxMaskDirective,
    ConfirmPopupModule,
    Button
  ],
  templateUrl: './curator-add.component.html',
  styleUrl: './curator-add.component.css'
})
export class CuratorAddComponent implements OnInit {
  private curatorService = inject(CuratorService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService)

  public curators: CuratorInterface[] = [];
  searchText: string = '';
  visible: boolean = false;
  visibleShow: boolean = false;
  public selectedCurator: Employee | null = null;


  @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;
  ngOnInit(): void {
    this.loadCurators()
  }

  searchCurator() {
    this.loadCurators(this.searchText);
  }

  loadCurators(search: string = ''): void {
    this.curatorService.getCurator(search).subscribe({
      next: (data) => {
        this.curators = data
      },
      error: (err) => console.error('Error loading curators:', err)
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


  public curatorForm = this.fb.group({
    fullname: [''],
    phone_number: [''],
    is_active: [true]
  });

  public curatorUpdateForm = this.fb.group({
    fullname: [''],
    phone_number: [''],
    is_active: [true]
  });

  onSubmit(): void {

    const phone = this.curatorForm.value.phone_number || '';

    const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 $1 $2 $3 $4');

    const curatorData: CuratorInterface = {
      id: this.selectedCurator?.id,
      fullname: this.curatorForm.value.fullname || '',
      phone_number: formattedPhone || '',
      is_active: this.curatorForm.value.is_active ?? true
    };

    this.curatorService.saveCurator(curatorData).subscribe(
      response => {

        this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Куратор успешно создан' });

        this.visible = false;
        this.loadCurators();
      },
      error => {
        if (error.status === 409) {
          this.messageService.add({ severity: 'warn', summary: 'Конфликт', detail: 'Куратор с таким номером телефона уже существует' });
        } else if (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 404 || error.status === 500) {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: `Ошибка на стороне сервера (${error.status})` });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Неизвестная ошибка', detail: 'Что-то пошло не так' });
        }
      }
    );
  }

  onUpdate(): void {
    const phone = this.curatorUpdateForm.value.phone_number || '';

    const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 $1 $2 $3 $4');

    const curatorData: CuratorInterface = {
      id: this.selectedCurator?.id,
      fullname: this.curatorUpdateForm.value.fullname || '',
      phone_number: formattedPhone || '',
      is_active: this.curatorUpdateForm.value.is_active ?? true
    };

    this.curatorService.saveCurator(curatorData).subscribe(
      response => {
        this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Данные куратора успешно обновлены' });
        this.visibleShow = false;
        this.loadCurators();
      },
      error => {
        if (error.status === 409) {
          this.messageService.add({ severity: 'warn', summary: 'Конфликт', detail: 'Куратор с таким номером телефона уже существует' });
        } else if (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 404 || error.status === 500) {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: `Ошибка на стороне сервера (${error.status})` });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Неизвестная ошибка', detail: 'Что-то пошло не так' });
        }
      }
    );
  }


  getCuratorById(employeeId: number): void {
    this.curatorService.getCuratorById(employeeId).subscribe(
      (employee: Employee) => {
        this.curatorUpdateForm.patchValue({
          fullname: employee.fullname || '',
          phone_number: employee.phone_number || '',
          is_active: employee.is_active ?? true
        });

        this.selectedCurator = employee;
        this.visibleShow = true;
      },
      error => {
        this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные сотрудника'});
      }
    );
  }

  deleteEmployee(): void {
    const curatorId = this.selectedCurator?.id
    if (curatorId) {
      this.curatorService.deleteCurator(curatorId).subscribe(
        response => {
          this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Куратор успешно удален'});
          this.visibleShow=false;
          this.loadCurators();
        },
        error => {
          this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Произошла ошибка при удалении куратора'});
        }
      );
    } else {
      this.messageService.add({severity: 'warn', summary: 'Внимание', detail: 'Не удалось определить куратора для удаления'});
    }
  }


  reject() {
    this.confirmPopup.reject();
  }

  confirm(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Куратор удален'});
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Отмена', detail: 'Вы отклонили'});
      }
    });
  }

  closeDialog() {
    this.visible  = false;
  }


}

