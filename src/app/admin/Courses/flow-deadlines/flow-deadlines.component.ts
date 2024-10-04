import {Component, HostListener, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {
  FlowHomework,
  FlowLessons,
  FlowModules,
  FlowTest,

} from "../../../../assets/models/getDeadlines.interface";
import {FlowService} from "../../../service/flow.service";
import {JsonPipe, Location, NgForOf, NgIf} from "@angular/common";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule, ValidationErrors, ValidatorFn,
  Validators
} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {ConfirmationService, MessageService, PrimeTemplate} from "primeng/api";
import {ConfirmPopupModule} from "primeng/confirmpopup";
import {CanComponentDeactivate} from "../../../can-deactivate-guard.guard";

function dateTimeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(control.value);
    if (!valid) return {'invalidDateTime': true};

    const [datePart, timePart] = control.value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const date = new Date(year, month - 1, day, hour, minute);
    if (isNaN(date.getTime())) return {'invalidDateTime': true};

    return null;
  };
}

@Component({
  selector: 'app-flow-deadlines',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    NgIf,
    JsonPipe,
    DialogModule,
    PrimeTemplate,
    ConfirmPopupModule
  ],
  templateUrl: './flow-deadlines.component.html',
  styleUrl: './flow-deadlines.component.css'
})
export class FlowDeadlinesComponent implements OnInit, CanComponentDeactivate {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private flowService = inject(FlowService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  public modules!: FlowModules[];
  public test!: any;
  public startsAt!: string;
  public homework!: any;
  public deadlineForm!: FormGroup;
  public flowEditForm!: FormGroup;
  public initialFormData: any;
  public flow_course_name!: string;
  public flow_index!: number;
  public visibleEditFlowModal: boolean = false;
  public flowId!: number;
  public courseId!: number;

  ngOnInit() {
    this.route.parent!.paramMap.subscribe(params => {
      this.flowId = +params.get('flowId')!;
    });

    this.route.paramMap.subscribe(params => {
      this.courseId = +params.get('courseId')!;
      this.loadDeadlines(this.courseId);
    });

    this.flowEditForm = this.fb.group({
      name: [this.flow_course_name, [Validators.required]],  // Установи начальное значение
      starts_at: [this.formatDateForInput(this.startsAt || ''), [Validators.required]] // Установи начальное значение даты
    });

  }

  canDeactivate(): boolean {
    if (this.hasUnsavedChanges()) {
      return window.confirm('У вас есть несохранённые изменения. Вы действительно хотите уйти?');
    }
    return true;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }

  private hasUnsavedChanges(): boolean {
    return this.deadlineForm.dirty || this.flowEditForm.dirty;
  }

  get modulesControls(): FormArray {
    return this.deadlineForm.get('modules') as FormArray;
  }

  getTopicControls(index: number): FormArray {
    return this.modulesControls.at(index).get('topics') as FormArray;
  }

  getLessonControls(moduleIndex: number, topicIndex: number): FormArray {
    return this.getTopicControls(moduleIndex).at(topicIndex).get('lessons') as FormArray;
  }

  private loadDeadlines(courseId: number) {
    this.flowService.getCourseDeadlines(courseId).subscribe({
      next: (data) => {
        console.log(data)
        this.modules = data.modules;
        this.startsAt = data.starts_at
        this.initForm(data.modules);
        this.initialFormData = data.modules;
        this.flow_index = data.flow_index
        this.flow_course_name = data.flow_course_name
      },
      error: (error) => console.error('Failed to load deadlines', error)
    });
  }

  private initForm(modulesData: FlowModules[]) {
    const modulesFormArray = modulesData.map(module =>
      this.fb.group({
        topics: this.fb.array(module.topics.map(topic =>
          this.fb.group({
            lessons: this.fb.array(topic.lessons.map(lesson =>
              this.fb.group({
                id: [lesson.id],
                deadline: [this.formatDateToDateTimeLocal(lesson.deadline || ''), [Validators.required, dateTimeValidator()]]
              })
            )),
            test: this.fb.group({
              id: [topic.test.id],
              deadline: [this.formatDateToDateTimeLocal(topic.test.deadline || ''), [Validators.required, dateTimeValidator()]]
            }),
            homework: this.fb.group({
              id: [topic.homework.id],
              deadline: [this.formatDateToDateTimeLocal(topic.homework.deadline || ''), [Validators.required, dateTimeValidator()]]
            })
          })
        ))
      })
    );

    this.deadlineForm = this.fb.group({
      modules: this.fb.array(modulesFormArray)
    });
  }


  private formatDateToDateTimeLocal(dateStr: string): string {
    if (!dateStr) return '';

    // Проверяем, есть ли время в дате
    if (dateStr.includes(' ')) {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('.').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);

      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } else {
      // Если времени нет, добавляем стандартное время
      const [day, month, year] = dateStr.split('.').map(Number);
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00`;
    }
  }

  private formatDateToServerFormat(dateTimeLocalStr: string): string {
    const [datePart, timePart] = dateTimeLocalStr.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}.${month}.${year} ${timePart}`;
  }

  public save() {
    if (!this.deadlineForm.valid) {
      this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Необходимо заполнить все поля!'});
      return;
    } else {
      const formattedData = this.formatDataForSave(this.deadlineForm.value); // Конвертация перед отправкой
      this.flowService.saveCourseDeadlines(formattedData).subscribe({
        next: (response) => {
          this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Дедлайны успешно обновлены!'});
          this.deadlineForm.markAsPristine(); // Сброс состояния формы после успешного сохранения

        },
        error: (error) => {
          console.error('Ошибка при сохранении данных', error);
        }
      });
    }
  }

  private formatDataForSave(formData: any): any {
    const lessons: FlowLessons[] = [];
    const tests: FlowTest[] = [];
    const homeworks: FlowHomework[] = [];

    formData.modules.forEach((module: FlowModules) => {
      module.topics.forEach(topic => {
        topic.lessons.forEach(lesson => {
          lessons.push({id: lesson.id, deadline: this.formatDateToServerFormat(lesson.deadline)}); // Конвертация даты урока
        });
        tests.push({id: topic.test.id, deadline: this.formatDateToServerFormat(topic.test.deadline)}); // Конвертация даты теста
        homeworks.push({id: topic.homework.id, deadline: this.formatDateToServerFormat(topic.homework.deadline)}); // Конвертация даты домашней работы
      });
    });

    return {
      flow_course_id: this.courseId,
      lessons,
      tests,
      homeworks
    };
  }

  public cancelChanges(event: Event,): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Вы действительно отменить изменения ?`,
      icon: 'pi pi-info-circle',
      acceptLabel: 'Да',
      rejectLabel: 'Нет',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.initForm(this.initialFormData);  // Инициализация формы с начальными данными
      }
    });
  }

  public back() {
    if (this.hasUnsavedChanges()) {
      const confirmLeave = window.confirm('У вас есть несохранённые изменения. Вы действительно хотите уйти?');
      if (confirmLeave) {
        this.router.navigate([`/admin/flow-details/${this.flowId}`]);
      }
    } else {
      this.router.navigate([`/admin/flow-details/${this.flowId}`]);
    }
  }

  public onCancel(): void {
    this.visibleEditFlowModal = false;
  }

  public showEditFlowDialog() {
    // Проверь, что данные уже загружены перед открытием диалога
    if (!this.flowEditForm) return;

    // Заполняем форму начальными значениями потока
    const currentFlowData = {
      name: this.flow_course_name,  // Название потока
      starts_at: this.formatDateForInput(this.startsAt) // Форматирование даты для инпута
    };

    // Используем patchValue, чтобы задать значения для формы
    this.flowEditForm.patchValue(currentFlowData);
    this.visibleEditFlowModal = true;
  }

  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';

    const [day, month, year] = dateStr.split('.'); // Предполагаем, что дата приходит в формате "DD.MM.YYYY"
    return `${year}-${month}-${day}`; // Возвращаем в формате "YYYY-MM-DD"
  }

  public onSubmitAddFlow(flowId: number) {
    if (!this.flowEditForm.valid) {
      this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Необходимо заполнить все поля!'});
      return;
    } else {
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
          this.loadDeadlines(this.courseId);
        },
        error: (error) => {
          this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Ошибка при редактировании потока'});
        }
      });
    }
  }

  private formatDate(dateStr: string): string {
    const [datePart, timePart] = dateStr.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}.${month}.${year}`;
  }

}
