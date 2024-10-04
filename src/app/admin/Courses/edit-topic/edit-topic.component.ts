import {Component, HostListener, inject, OnDestroy, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {TopicService} from "../../../service/topic.service";
import {Lesson} from "../../../../assets/models/lesson.interface";
import {Answer, Question, Test} from "../../../../assets/models/test.interface";
import {Homework} from "../../../../assets/models/homework.interface";
import {DialogModule} from "primeng/dialog";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule, ValidationErrors,
  Validators
} from "@angular/forms";
import {EditorModule} from "primeng/editor";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ConfirmPopupModule} from "primeng/confirmpopup";
import {AutoExpandDirective} from "../../../auto-expand.directive";
import {DialogService} from "primeng/dynamicdialog";
import {CanComponentDeactivate} from "../../../can-deactivate-guard.guard";

type FormAnswer = FormGroup<{
  text: FormControl<string>;
  is_correct: FormControl<boolean>;
}>;

type FormQuestion = FormGroup<{
  text: FormControl<string>;
  answers: FormArray<FormAnswer>;
}>;

type Form = FormGroup<{
  duration: FormControl<number>;
  questions: FormArray<FormQuestion>;
}>;

function atLeastOneCorrectAnswer(control: AbstractControl): ValidationErrors | null {
  const answersArray = control.get('answers') as FormArray;
  const hasCorrectAnswer = answersArray.controls.some(answerCtrl => answerCtrl.get('is_correct')?.value === true);

  return hasCorrectAnswer ? null : {noCorrectAnswer: true};
}

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
    AutoExpandDirective,
  ],
  templateUrl: './edit-topic.component.html',
  styleUrl: './edit-topic.component.css'
})
export class EditTopicComponent implements OnInit, CanComponentDeactivate {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  private fb = inject(NonNullableFormBuilder);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);

  private courseId!: number;
  private moduleId!: number;
  public topicId!: number;
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

    this.initializeForm();
    this.initAddTopicForm();
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
      $event.returnValue = true; // Стандартное сообщение браузера
    }
  }

  private hasUnsavedChanges(): boolean {
    return (
      this.testForm.dirty ||
      this.areLessonsChanged() ||
      this.areQuestionsChanged() ||
      this.isHomeworkChanged()
    );
  }

  private areLessonsChanged(): boolean {
    return this.lessons.some(lesson => lesson.file instanceof File || lesson.fileName === '');
  }

  private areQuestionsChanged(): boolean {
    return this.questions().controls.some(questionControl => {
      return questionControl.dirty ||
        (questionControl.get('answers') as FormArray).controls.some(answerControl => answerControl.dirty);
    });
  }

  private isHomeworkChanged(): boolean {
    return (
      this.homeworkFile instanceof File ||
      this.homeworkFileName !== this.homework?.file ||
      (this.testForm.get('description')?.dirty ?? false)
    );
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
    }, {validators: atLeastOneCorrectAnswer});
  }

  public addQuestion(): void {
    this.questions().push(this.generateQuestion());
    this.testForm.markAsDirty(); // Помечаем форму как "грязную" после добавления вопроса
  }

  public deleteQuestion(event: Event, index: number): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Вы действительно хотите удалить этот вопрос ?`,
      icon: 'pi pi-info-circle',
      rejectLabel: 'Нет',
      acceptLabel: 'Да',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: `Вопрос успешно удален!`
        });
        this.questions().removeAt(index);
        this.testForm.markAsDirty(); // Помечаем форму как "грязную" после удаления вопроса
      }
    });
  }

  public setCorrectAnswer(questionIndex: number, correctAnswerIndex: number): void {
    const answers = this.answers(questionIndex) as FormArray;

    answers.controls.forEach((ctrl, index) => {
      const isCorrectControl = ctrl.get('is_correct') as FormControl;
      isCorrectControl.setValue(index === correctAnswerIndex);
    });

    this.testForm.markAsDirty(); // Помечаем форму как "грязную" после изменения правильного ответа
  }

  public questions(): FormArray {
    return this.testForm.get('questions') as FormArray;
  }

  public answers(questionIndex: number): FormArray {
    const questionForm = this.questions().at(questionIndex) as FormGroup;
    let answersArray = questionForm.get('answers') as FormArray;

    while (answersArray.length < 4) {
      answersArray.push(this.generateAnswer());
    }

    answersArray.controls.forEach(answer => {
      answer.valueChanges.subscribe(() => {
        this.testForm.markAsDirty(); // Помечаем форму как "грязную" при изменении текста ответа
      });
    });

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
      },
      error: (error) => {
        console.error('Error loading topic content:', error);
      }
    });
  }

  public addLesson(): void {
    if (this.addLessonForm.invalid) {
      return;
    }
    const newLesson: Lesson = {
      name: this.addLessonForm.value.name,
    };
    this.lessons.push(newLesson);
    this.AddLessonVisible = false;
    this.addLessonForm.reset();
    this.testForm.markAsDirty(); // Помечаем форму как "грязную" после добавления урока
  }

  public deleteLesson(event: Event, index: number): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Вы действительно хотите удалить этот урок ?`,
      icon: 'pi pi-info-circle',
      rejectLabel: 'Нет',
      acceptLabel: 'Да',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: `Урок успешно удален!`
        });
        this.lessons.splice(index, 1);
        this.testForm.markAsDirty(); // Помечаем форму как "грязную" после удаления урока
      }
    });
  }

  public deleteTopic(event: Event, topicId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Вы действительно хотите удалить эту тему ?`,
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
              detail: `Тема успешно удалена!`
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
    if (this.testForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Для сохранения полностью заполните форму.'
      });
      return;
    }

    if (!this.validateLessons()) {
      return;
    }

    if (!this.validateHomework()) {
      return;
    }

    if (!this.validateQuestions()) {
      return;
    }

    const formData = new FormData();
    formData.append('topic_id', String(this.topicId));

    const lessonsData = this.lessons.map((lesson, index) => {
      return {
        name: lesson.name,
        file: lesson.file instanceof File ? `lesson_file_${index}.mp4` : lesson.file
      };
    });
    formData.append('lessons', JSON.stringify(lessonsData));

    this.lessons.forEach((lesson, index) => {
      if (lesson.file instanceof File) {
        formData.append(`lesson_file_${index}.mp4`, lesson.file);
      }
    });

    const homeworkData = {
      description: this.testForm.get('description')?.value,
      file: this.homeworkFile ? 'homework_file' : this.homeworkFileName || ''
    };
    formData.append('homework', JSON.stringify(homeworkData));

    if (this.homeworkFile instanceof File) {
      formData.append('homework_file', this.homeworkFile);
    } else if (this.homeworkFileName) {
      formData.append('homework_file_name', this.homeworkFileName);
    }

    formData.append('test', JSON.stringify(this.testForm.value));

    this.topicService.saveTopicContent(formData).subscribe({
      next: response => {
        this.testForm.markAsPristine(); // Сброс состояния формы после успешного сохранения
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
          this.testForm.markAsDirty(); // Помечаем форму как "грязную" после удаления файла
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

  public back(): void {
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

      const fileType = file.type;
      if (fileType !== 'video/mp4') {
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Только .mp4 файлы могут быть загружены для уроков.'
        });
        return;
      }

      this.lessons[index].file = file;
      this.lessons[index].fileName = file.name;
      this.testForm.markAsDirty(); // Помечаем форму как "грязную" после выбора файла
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

  private validateLessons(): boolean {
    const invalidLesson = this.lessons.some(lesson => !lesson.file);
    if (invalidLesson) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Каждый урок должен иметь прикрепленный файл.'
      });
      return false;
    }
    return true;
  }

  private validateHomework(): boolean {
    const descriptionControl = this.testForm.get('description');
    const description = descriptionControl?.value?.trim();

    if ((!this.homeworkFile && !this.homeworkFileName) || !description || description === '<p></p>' || description === '<br>' || description.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Домашнее задание должно содержать файл и описание.'
      });
      return false;
    }

    return true;
  }


  private validateQuestions(): boolean {
    const invalidQuestion = this.questions().controls.some(questionControl => {
      const text = questionControl.get('text')?.value.trim();
      const answers = (questionControl.get('answers') as FormArray).controls;
      const hasEmptyAnswer = answers.some(answerControl => !answerControl.get('text')?.value.trim());
      return !text || hasEmptyAnswer;
    });

    if (invalidQuestion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Каждый вопрос должен содержать текст и хотя бы один ответ.'
      });
      return false;
    }
    return true;
  }
}
