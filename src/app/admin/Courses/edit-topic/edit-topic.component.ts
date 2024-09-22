import {Component, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {TopicService} from "../../../service/topic.service";
import {Lesson} from "../../../../assets/models/lesson.interface";
import {Answer, Question, Test} from "../../../../assets/models/test.interface";
import {Homework} from "../../../../assets/models/homework.interface";
import {DialogModule} from "primeng/dialog";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {EditorModule} from "primeng/editor";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ConfirmPopupModule} from "primeng/confirmpopup";

type FormAnswer = FormGroup<{
  text: FormControl<string>;
  is_correct: FormControl<boolean>;  // Булевое значение для правильного ответа
}>;

type FormQuestion = FormGroup<{
  text: FormControl<string>;
  answers: FormArray<FormAnswer>;
}>;

type Form = FormGroup<{
  duration: FormControl<number>;
  questions: FormArray<FormQuestion>;
}>;

@Component({
  selector: 'app-edit-topic',
  standalone: true,
  imports: [
    NgForOf,
    DialogModule,
    NgIf,
    ReactiveFormsModule,
    EditorModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
  ],
  templateUrl: './edit-topic.component.html',
  styleUrl: './edit-topic.component.css'
})
export class EditTopicComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  private fb = inject(NonNullableFormBuilder);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  private courseId!: number;
  private moduleId!: number;
  public topicId!: number;
  public selectedFile: File | null = null;
  public selectedFileName: string | undefined;
  public homeworkFile: File | null = null;
  public homeworkFileName: string | undefined;
  public homeworkDescription?: string;
  public topicName?: string;
  public topicIndex!: number;
  public lessons: Lesson[] = [];
  public test!: Test;
  public homework!: Homework;
  public AddLessonVisible: boolean = false;
  public addLessonForm!: FormGroup;

  public testForm: FormGroup = this.fb.group({
    duration: [15, Validators.required],
    questions: this.fb.array([]),
    description: ['']
  });

  ngOnInit() {
    this.route.parent!.parent!.paramMap.subscribe(params => {
      this.courseId = +params.get('courseId')!;
    });
    this.route.parent!.paramMap.subscribe(params => {
      this.moduleId = +params.get('moduleId')!;
    });
    this.route.paramMap.subscribe(params => {
      this.topicId = +params.get('topicId')!;
      this.loadTopicContent();
    });
    // this.testForm.get('description')?.valueChanges.subscribe(value => {
    //   this.homeworkDescription = value;
    // });

    this.initializeForm();
    this.initAddTopicForm();

  }

  private initAddTopicForm() {
    this.addLessonForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  private initializeForm(testData?: Test) {
    if (testData) {
      this.testForm.setControl('duration', new FormControl(testData.duration, Validators.required));
      this.testForm.setControl('questions', this.fb.array(testData.questions.map(question => this.generateQuestion(question))));
    }
  }

  private generateAnswer(answerData?: Answer): FormAnswer {
    return this.fb.group({
      text: [answerData?.text || '', Validators.required],
      is_correct: [answerData?.is_correct || false]  // Булевое значение
    });
  }

  private generateQuestion(questionData?: Question): FormQuestion {
    return this.fb.group({
      text: [questionData?.text || '', Validators.required],
      answers: this.fb.array(questionData?.answers.map(answer => this.generateAnswer(answer)) || [])
    });
  }

  public addQuestion() {
    this.questions().push(this.generateQuestion());
  }

  public deleteQuestion(event: Event, index: number) {
    console.log(this.questions())
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Вы действительно хотите удалить вопрос - "${this.questions().value[index].text}" ?`,
      icon: 'pi pi-info-circle',
      rejectLabel: 'Нет',
      acceptLabel: 'Да',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: `Вопрос успешно удален`!
        });
        this.questions().removeAt(index);
      }
    });
  }

  public setCorrectAnswer(questionIndex: number, correctAnswerIndex: number): void {
    const answers = this.answers(questionIndex) as FormArray;

    answers.controls.forEach((ctrl, index) => {
      const isCorrectControl = ctrl.get('is_correct') as FormControl;
      isCorrectControl.setValue(index === correctAnswerIndex);  // Устанавливаем true для выбранного, false для остальных
    });
  }

  public questions(): FormArray {
    return this.testForm.get('questions') as FormArray;
  }

  public answers(questionIndex: number): FormArray {
    const questionForm = this.questions().at(questionIndex) as FormGroup;
    let answersArray = questionForm.get('answers') as FormArray;

    // Проверяем, есть ли уже 4 ответа, если нет - добавляем недостающие
    while (answersArray.length < 4) {
      answersArray.push(this.generateAnswer());
    }

    return answersArray;
  }

  private loadTopicContent() {
    this.topicService.getTopicContent(this.topicId).subscribe({
      next: (data) => {
        this.lessons = data.lessons.map(lesson => ({
          ...lesson,
          fileName: typeof lesson.file === 'string' ? lesson.file : undefined
        }));
        this.test = data.test;
        this.topicName = data.topic.name
        this.topicIndex = data.topic.index
        console.log(this.topicName)
        this.initializeForm(data.test);

        this.homeworkFileName = data.homework.file;
        this.homeworkDescription = data.homework.description;

        this.testForm.get('description')?.setValue(this.homeworkDescription);

        console.log('Topic Content Loaded:', data);
      },
      error: (error) => {
        console.error('Error loading topic content:', error);
      }
    });
  }

  public addLesson() {
    if (this.addLessonForm.invalid) {
      return;
    }
    const newLesson: Lesson = {
      name: this.addLessonForm.value.name,
    };
    this.lessons.push(newLesson);
    this.AddLessonVisible = false;
    this.addLessonForm.reset();
  }

  public deleteLesson(event: Event, index: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Вы действительно хотите удалить урок - "${this.lessons[index].name}" ?`,
      icon: 'pi pi-info-circle',
      rejectLabel: 'Нет',
      acceptLabel: 'Да',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: `Урок - "${this.lessons[index].name}" успешно удален!`
        });
        this.lessons.splice(index, 1);
      }
    });
  }

  public deleteTopic(event: Event, topicId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Вы действительно хотите удалить тему - "${this.topicName}" ?`,
      icon: 'pi pi-info-circle',
      acceptLabel: 'Да',
      rejectLabel: 'Нет',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.topicService.deleteTopic(topicId).subscribe({
          next: () => {
            this.router.navigate([`/admin/edit-course/${this.courseId}/edit-module/${this.moduleId}`]);
            this.messageService.add({
              severity: 'success',
              summary: 'Успешно',
              detail: `Тема - "${this.topicName}" успешно удалена!`
            });
          },
          error: (err) => {
            console.error('Ошибка при удалении модуля:', err);
          }
        });
      }
    });
  }

  public saveContent(): void {

    const formData = new FormData();
    formData.append('topic_id', String(this.topicId));

    const lessonsData = this.lessons.map((lesson, index) => {
      return {
        name: lesson.name,
        file: lesson.file instanceof File ? `lesson_file_${index}` : lesson.file
      };
    });

    formData.append('lessons', JSON.stringify(lessonsData));

    // Добавляем новые файлы в FormData (бинарные данные)
    this.lessons.forEach((lesson, index) => {
      if (lesson.file instanceof File) {
        formData.append(`lesson_file_${index}`, lesson.file);
      }
    });

    const homeworkData = {
      description: this.testForm.get('description')?.value,
      file: this.homeworkFile instanceof File ? 'homework_file' : this.homeworkFileName || ''
    };
    formData.append('homework', JSON.stringify(homeworkData));

    if (this.homeworkFile instanceof File) {
      formData.append('homework_file', this.homeworkFile);
    }

    formData.append('test', JSON.stringify(this.testForm.value));

    this.topicService.saveTopicContent(formData).subscribe({
      next: response => {
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: `Успешно сохранено!`
        });
      },
      error: error => console.error('Failed to save content:', error)
    });
  }

  public removeLessonFile(event: Event, index: number): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Вы действительно хотите удалить файл ${index + 1} ?`,
      icon: 'pi pi-info-circle',
      acceptLabel: 'Да',
      rejectLabel: 'Нет',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        if (this.lessons[index]) {
          this.lessons[index].file = '';
          this.lessons[index].fileName = undefined;
          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: `Файл ${index + 1} успешно удален!`
          });
        }
      }
    });
  }

  public showAddDialog() {
    this.AddLessonVisible = true;
  }

  public back() {
    this.router.navigate([`/admin/edit-course/${this.courseId}/edit-module/${this.moduleId}`]);
  }

  public triggerFileInput(index: number): void {
    const fileInput = document.getElementById(`file${index}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  public onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.lessons[index].file = file;
      this.lessons[index].fileName = file.name;
      console.log(`Файл для урока ${index + 1}: ${file.name}`);
    }
  }

  public onHomeworkFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.homeworkFile = element.files[0];
      this.homeworkFileName = this.homeworkFile.name;
      console.log('Homework file set:', this.homeworkFileName);
    }
  }

  public triggerHomeworkFileInput(): void {
    const fileInput = document.getElementById('homeworkFile') as HTMLInputElement;
    fileInput.click();
  }
}
