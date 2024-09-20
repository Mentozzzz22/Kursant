import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {
  FlowHomework,
  FlowLessons,
  FlowModules,
  FlowTest,
  FlowTopics,
  GetDeadlines
} from "../../../assets/models/getDeadlines.interface";
import {FlowService} from "../../service/flow.service";
import {NgForOf, NgIf} from "@angular/common";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule, ValidatorFn,
  Validators
} from "@angular/forms";

function dateTimeValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/.test(control.value);
    return valid ? null : {'invalidDateTime': {value: control.value}};
  };
}

@Component({
  selector: 'app-flow-deadlines',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './flow-deadlines.component.html',
  styleUrl: './flow-deadlines.component.css'
})
export class FlowDeadlinesComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private flowService = inject(FlowService);
  private fb = inject(FormBuilder);
  public deadlines!: GetDeadlines;
  public modules!: FlowModules[];
  public topics!: FlowTopics[];
  public lessons!: FlowLessons[];
  public test!: any;
  public homework!: any;
  public deadlineForm!: FormGroup;

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

  getTestControls(moduleIndex: number, topicIndex: number): any {
    console.log(this.getTopicControls(moduleIndex).at(topicIndex).get('test')!.get('testDeadline')?.value);
    return this.getTopicControls(moduleIndex).at(topicIndex).get('test')
  }

  private loadDeadlines(courseId: number) {
    this.flowService.getCourseDeadlines(courseId).subscribe({
      next: (data) => {
        this.modules = data.modules;
        this.initForm(data.modules);
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

  public back() {
    this.router.navigate([`/admin/flow-details/${this.flowId}`])
  }

}
