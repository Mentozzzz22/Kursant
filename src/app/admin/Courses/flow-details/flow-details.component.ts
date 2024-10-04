import {Component, inject, OnInit} from '@angular/core';
import {DropdownModule} from "primeng/dropdown";
import {ModuleService} from "../../../service/module.service";
import {FlowService} from "../../../service/flow.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {Curator, flowCourses, GetFlow} from "../../../../assets/models/getFlow.interface";
import {NgForOf, NgIf} from "@angular/common";
import {CuratorService} from "../../../service/curator.service";
import {DialogModule} from "primeng/dialog";
import {PaginatorModule} from "primeng/paginator";
import {ConfirmationService, MessageService} from "primeng/api";
import {filter, Subscription} from "rxjs";
import {ConfirmPopupModule} from "primeng/confirmpopup";

@Component({
  selector: 'app-flow-details',
  standalone: true,
  imports: [
    DropdownModule,
    NgForOf,
    DialogModule,
    PaginatorModule,
    ReactiveFormsModule,
    NgIf,
    RouterOutlet,
    ConfirmPopupModule
  ],
  templateUrl: './flow-details.component.html',
  styleUrl: './flow-details.component.css'
})
export class FlowDetailsComponent implements OnInit {
  private flowService = inject(FlowService);
  private curatorService = inject(CuratorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  public flowIndex!: number;
  public isDeadlinesOpened: boolean = false;
  public flow!: GetFlow;
  public curators: Curator[] = [];
  public courses: flowCourses[] = [];
  public flowId!: number;
  public flowName!: string;
  public flowForm!: FormGroup;
  public flowEditForm!: FormGroup;
  public AddCuratorVisible: boolean = false;
  public visibleEditFlowModal: boolean = false;
  public addCuratorForm!: FormGroup;
  public selectedCourseId!: number;
  private navigationSubscription: Subscription;

  constructor() {
    this.navigationSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkModuleOpened();
    });
  }

  private checkModuleOpened() {
    // Здесь мы проверяем URL или параметры роута, чтобы определить, должен ли быть открыт модуль
    this.isDeadlinesOpened = this.route.firstChild != null;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.flowId = +params.get('flowId')!;
      this.loadFlow(this.flowId)
    });

    this.flowEditForm = this.fb.group({
      name: ['', [Validators.required]],
      starts_at: ['', [Validators.required]],
    })

    this.loadCurators()
    this.initAddCuratorForm();
    this.checkModuleOpened();
  }

  private initAddCuratorForm() {
    this.addCuratorForm = this.fb.group({
      curator_id: ['', Validators.required],
      flow_course_id: [this.selectedCourseId, Validators.required]
    });
  }

  public showAddDialog(courseId: number) {
    this.selectedCourseId = courseId;
    this.initAddCuratorForm();
    this.AddCuratorVisible = true;
  }

  private loadCurators(): void {
    this.curatorService.getCurators().subscribe({
      next: (data) => {
        this.curators = data
      },
      error: (err) => console.error('Error loading curators:', err)
    });

  }

  public loadFlow(flowId: number) {
    this.flowService.getFlow(flowId).subscribe(data => {
      this.flow = data;
      this.courses = data.courses
      this.flowIndex = data.index
      this.flowName = data.name

      this.flowEditForm.patchValue({
        name: this.flow.name,  // Устанавливаем название потока
        starts_at: this.formatDateForInput(this.flow.starts_at)  // Устанавливаем дату начала
      });
    });
  }

  public addCurator() {
    console.log("Form Value:", this.addCuratorForm.value);
    if (this.addCuratorForm.valid) {
      const payload = this.addCuratorForm.value;
      console.log("Sending payload:", payload);
      this.flowService.addCuratorToCourse(payload).subscribe(response => {
        console.log("Response from server:", response);
        this.messageService.add({severity: 'success', summary: 'Успех', detail: 'Куратор добавлен'});
        this.AddCuratorVisible = false;
        this.loadFlow(this.flowId);
      }, error => {
        console.error("Error from server:", error);
      });
    }
  }

  public removeCurator(event: Event, curatorId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Вы действительно хотите удалить этого куратора?',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Нет',
      acceptLabel: 'Да',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.flowService.removeCuratorFromCourse(curatorId).subscribe({
          next: (response) => {
            this.messageService.add({severity: 'success', summary: 'Успех', detail: 'Куратор удален'});
            this.loadFlow(this.flowId); // Перезагрузить данные потока
          },
          error: (error) => {
            this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить куратора'});
          }
        });
      }
    });
  }

  public navigateToDeadlines(courseId: number) {
    this.router.navigate([`/admin/flow-details/${this.flowId}/flow-deadlines/`, courseId]);
    this.isDeadlinesOpened = true;
  }

  public navigateToCourses() {
    this.router.navigate(['/admin/course']);
  }

  public showEditFlowDialog() {
    // Убедимся, что данные потока загружены
    if (!this.flowEditForm || !this.flow) {
      this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Данные потока не загружены' });
      return;
    }

    // Показываем модальное окно с заполненными полями
    this.visibleEditFlowModal = true;
  }

  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';

    const [day, month, year] = dateStr.split('.');  // Предполагаем, что дата приходит в формате "DD.MM.YYYY"
    return `${year}-${month}-${day}`;  // Преобразуем в формат "YYYY-MM-DD"
  }

  public onCancel(): void {
    this.visibleEditFlowModal = false;
  }

  public onSubmitAddFlow(flowId: number) {
    if (!this.flowEditForm.valid) {
      this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Необходимо заполнить все поля!'});
      return;
    }

    const formattedDate = this.formatDate(this.flowEditForm.get('starts_at')!.value);

    const flowData = {
      flow_id: flowId,
      name: this.flowEditForm.get('name')!.value,
      starts_at: formattedDate
    };

    this.flowService.saveFlow(flowData).subscribe({
      next: (response) => {
        this.messageService.add({severity: 'success', summary: 'Успех', detail: 'Поток успешно изменен'});
        this.visibleEditFlowModal = false;
        this.loadFlow(this.flowId)
      },
      error: (error) => {
        this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Ошибка при редактировании потока'});
      }
    });
  }

  private formatDate(dateStr: string): string {
    const [datePart, timePart] = dateStr.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}.${month}.${year}`;
  }

}
