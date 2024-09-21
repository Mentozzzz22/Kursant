import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {
  FlowHomework,
  FlowLessons,
  FlowModules,
  FlowTest,
  FlowTopics,
  GetDeadlines
} from "../../../../assets/models/getDeadlines.interface";
import {FlowService} from "../../../service/flow.service";
import {JsonPipe, NgForOf, NgIf} from "@angular/common";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule, ValidationErrors, ValidatorFn,
  Validators
} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {MessageService, PrimeTemplate} from "primeng/api";

function dateTimeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/.test(control.value);
    if (!valid) return {'invalidDateTime': true};

    const [day, month, year, hour, minute] = control.value.split(/\D/).map(Number);
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
    PrimeTemplate
  ],
  templateUrl: './flow-deadlines.component.html',
  styleUrl: './flow-deadlines.component.css'
})
export class FlowDeadlinesComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private flowService = inject(FlowService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  public modules!: FlowModules[];
  public test!: any;
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
      name: ['', [Validators.required]],
      starts_at: ['', [Validators.required]],
    })
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
        this.modules = data.modules;
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
                deadline: [lesson.deadline, [Validators.required, dateTimeValidator()]] // Добавляем валидатор
              })
            )),
            test: this.fb.group({
              id: [topic.test.id],
              deadline: [topic.test.deadline, [Validators.required, dateTimeValidator()]] // Тесты
            }),
            homework: this.fb.group({
              id: [topic.homework.id],
              deadline: [topic.homework.deadline, [Validators.required, dateTimeValidator()]] // Домашние задания
            })
          })
        ))
      })
    );

    this.deadlineForm = this.fb.group({
      modules: this.fb.array(modulesFormArray)
    });
  }

  public save() {
    if (this.deadlineForm.valid) {
      console.log(this.deadlineForm.getRawValue())
      const formattedData = this.formatDataForSave(this.deadlineForm.value);
      this.flowService.saveCourseDeadlines(formattedData).subscribe({
        next: (response) => {
          console.log('Данные успешно сохранены', response);
          // Обработка успешного сохранения
        },
        error: (error) => {
          console.error('Ошибка при сохранении данных', error);
          // Обработка ошибок
        }
      });
    }
    console.log(this.deadlineForm.getRawValue())
  }

  private formatDataForSave(formData: any): any {
    const lessons: FlowLessons[] = [];
    const tests: FlowTest[] = [];
    const homeworks: FlowHomework[] = [];

    formData.modules.forEach((module: FlowModules) => {
      module.topics.forEach(topic => {
        topic.lessons.forEach(lesson => {
          lessons.push({id: lesson.id, deadline: lesson.deadline});
        });
        console.log(topic.test.deadline)
        tests.push({id: topic.test.id, deadline: topic.test.deadline});
        homeworks.push({id: topic.homework.id, deadline: topic.homework.deadline});
      });
    });

    return {
      flow_course_id: this.courseId,
      lessons,
      tests,
      homeworks
    };
  }

  public cancelChanges(): void {
    this.initForm(this.initialFormData);  // Инициализация формы с начальными данными
  }

  public back() {
    this.router.navigate([`/admin/flow-details/${this.flowId}`])
  }

  public onCancel(): void {
    this.visibleEditFlowModal = false;
  }

  public showEditFlowDialog() {
    this.visibleEditFlowModal = true;
  }

  public onSubmitAddFlow(flowId :number) {
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
        this.loadDeadlines(this.courseId);
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
