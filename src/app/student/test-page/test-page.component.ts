import {Component, inject, input, InputSignal, OnInit} from '@angular/core';
import {ProgressBarModule} from "primeng/progressbar";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {Button} from "primeng/button";
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {RadioButtonModule} from "primeng/radiobutton";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {LearnerTestService} from "../../service/learner-test.service";
import {getLearnerTest, Testing} from "../../../assets/models/getLearner_test.interface";
import {LearnerLessons} from "../../../assets/models/learner_course.interface";
import {MessageService} from "primeng/api";
import {GetLearnerQuestions, LearnerQuestions} from "../../../assets/models/getLearnerQuestions.interface";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ProgressBarModule,
    DialogModule,
    InputTextModule,
    Button,
    NgIf,
    NgForOf,
    BreadcrumbModule,
    DatePipe,
    NgClass,
    RadioButtonModule,
    NgStyle
  ],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.css'
})
export class TestPageComponent implements OnInit {

  private learnerTestService = inject(LearnerTestService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private messageService = inject(MessageService);
  private sanitizer = inject(DomSanitizer);
  private datePipe = inject(DatePipe)
  public courseName!: string;
  public topicName!: string;
  public teacherName!: string;
  public lessons: LearnerLessons[] = [];

  public progress: number = 0;
  public startTestVisible: boolean = false;
  public endTestVisible: boolean = false;
  public isTestStarted: boolean = false; // Управление состоянием теста
  public currentQuestionIndex: number = 0; // Отслеживает текущий выбранный вопрос
  public questions: LearnerQuestions[] = [];
  public questionData!: GetLearnerQuestions;
  public answeredQuestions: { [key: number]: boolean } = {}; // Используем объект для хранения состояний
  public testForm!: FormGroup;
  public testId!: number;
  public getLearnerTest!: getLearnerTest;
  public learnerTest!: Testing;
  public testStatus!: string;
  public endsAt!: number;
  public remainingTime: number = 0; // Время, которое осталось в секундах
  private timerInterval: any;
  public displayedTime: string = '';
  public displayAlertMessage: boolean = false;

  public lessonsAndTests: any[] = [];
  progressSegments: { filled: boolean }[] = [];
  private fb = inject(FormBuilder)

  constructor() {
    this.initializeForm();
  }


  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.testId = +params.get('testId')!;
      this.loadTest(this.testId);
    });

    if (this.isTestStarted) {
      this.getQuestions(this.testId);
    }
  }

  loadTest(testId: number) {

    this.learnerTestService.getTest(testId).subscribe((data) => {
      this.getLearnerTest = data;
      this.lessons = data.lessons;
      this.courseName = data.course_name;
      this.topicName = data.topic_name;
      this.teacherName = data.teacher_fullname
      this.learnerTest = data.test
      this.testStatus = data.test.status

      this.lessonsAndTests = [...this.lessons];

      if (data.test) {
        this.lessonsAndTests.push({
          id: data.test.id,
          status: data.test.status,
          type: 'test'
        });
      }

      if (data.homework) {
        this.lessonsAndTests.push({
          id: data.homework.id,
          status: data.homework.status,
          type: 'homework'
        });
      }
      this.calculateProgress();
    })

    this.answeredQuestions = new Array(this.questions.length).fill(false);

    this.questions.forEach((question) => {
      this.testForm.addControl(
        'question_' + question.id,
        this.fb.control(null, Validators.required)
      );
    });

    // Восстановление состояния теста после перезагрузки
    this.restoreSavedState();
  }

  public getQuestions(testId: number) {
    this.learnerTestService.getTestQuestions(testId).subscribe(data => {
      this.questions = data.questions;
      this.questions.forEach(question => {
        question.safeHtmlContent = this.sanitizeHtmlContent(question.question);
      });
      this.questionData = data;
      this.initializeForm();
      this.startTimer();
    });
  }

  public safeHtmlContent!: SafeHtml;

  // Возвращаем SafeHtml для использования в шаблоне
  sanitizeHtmlContent(htmlContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  // Метод для инициализации формы с вопросами
  initializeForm() {
    // Создание формы и добавление контролов
    this.testForm = this.fb.group({
      answers: this.fb.array([])
    });

    const answersArray = this.testForm.get('answers') as FormArray;
    this.questions.forEach(question => {
      answersArray.push(this.fb.group({
        questionId: question.id,
        answerId: null
      }));
      const controlName = 'question_' + question.id;
      if (!this.testForm.contains(controlName)) {
        this.testForm.addControl(
          controlName,
          this.fb.control(null, Validators.required)
        );
      }
    });

    this.restoreSavedState(); // Восстановление состояния после создания формы
  }

  get answersFormArray(): FormArray {
    return this.testForm.get('answers') as FormArray;
  }

  // Показ диалогового окна для начала теста
  showStartTestDialog() {
    this.startTestVisible = true;
  }

  // Показ диалогового окна для завершения теста
  showEndTestDialog() {
    this.checkUnansweredQuestions();
    this.endTestVisible = true;
  }

  // Старт теста
  public startTest(testId: number): void {
    const now = new Date().getTime();
    const durationInMilliseconds = this.learnerTest.duration * 60 * 1000;
    this.endsAt = now + durationInMilliseconds;
    localStorage.setItem('endsAt', this.endsAt.toString());
    let dateToMaks = this.datePipe.transform(this.endsAt, 'dd.MM.yyyy HH:mm')

    this.learnerTestService.startTest(dateToMaks, testId).subscribe(
      response => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Тест начат!'
          });
        }
        this.isTestStarted = true;
        this.startTestVisible = false;
        localStorage.setItem('isTestStarted', 'true'); // Сохранение состояния теста
        this.getQuestions(testId)

      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось начать тест.'
        });
      }
    )
  }

  // Завершение теста
  public endTest() {
    clearInterval(this.timerInterval);
    this.isTestStarted = false;
    this.endTestVisible = false;
    this.submitTest();
    this.testStatus = 'passed';
  }

  saveAnswer(questionId: number, index: number, answerId: number) {
    let savedAnswers = JSON.parse(localStorage.getItem('testAnswers') || '{}');
    savedAnswers[questionId] = index; // Сохраняем ответ для конкретного вопроса
    localStorage.setItem('testAnswers', JSON.stringify(savedAnswers));

    const answersArray = this.answersFormArray;
    const questionGroup = answersArray.controls.find(control => control.value.questionId === questionId) as FormGroup;

    if (questionGroup) {
      questionGroup.patchValue({answerId: answerId});
      this.answeredQuestions[questionId] = true;
      localStorage.setItem('answeredQuestions', JSON.stringify(this.answeredQuestions));
    } else {
      console.error(`Элемент управления для questionId ${questionId} не найден в массиве ответов`);
    }

    const controlName = 'question_' + questionId;
    if (this.testForm.contains(controlName)) {
      this.testForm.get(controlName)?.setValue(index);
    } else {
      console.error(`Элемент управления формы для questionId ${questionId} не найден`);
    }

    localStorage.setItem('answers', JSON.stringify(this.testForm.getRawValue().answers));
  }


  // Восстановление сохраненных ответов и состояния
  restoreSavedState() {
    const savedAnswers = JSON.parse(localStorage.getItem('testAnswers') || '{}');
    const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '{}');
    const answers = JSON.parse(localStorage.getItem('answers') || '[]');

    const answersFormArray = this.testForm.get('answers') as FormArray;
    answers.forEach((answer: any, index: any) => {
      if (answersFormArray.at(index)) {
        answersFormArray.at(index).setValue(answer);
      } else {
        answersFormArray.push(this.fb.group(answer));
      }
    });

    Object.keys(savedAnswers).forEach((questionId) => {
      const controlName = 'question_' + questionId;
      if (this.testForm?.contains(controlName)) {
        this.testForm.get(controlName)?.setValue(savedAnswers[questionId]);
      }
    });

    this.answeredQuestions = answeredQuestions; // Восстанавливаем состояние отвеченных вопросов

    const savedIndex = JSON.parse(localStorage.getItem('currentQuestionIndex') || '0');
    this.currentQuestionIndex = savedIndex;

    const isTestStarted = localStorage.getItem('isTestStarted');
    this.isTestStarted = isTestStarted === 'true';

    const savedEndsAt = localStorage.getItem('endsAt');
    if (savedEndsAt) {
      this.endsAt = parseInt(savedEndsAt);
    }
    if (this.isTestStarted) {
      this.startTimer();
    }
  }

// Обновление формы при переключении вопросов
  updateFormForCurrentQuestion() {
    const currentQuestionId = this.questions[this.currentQuestionIndex].id;
    const savedAnswers = JSON.parse(localStorage.getItem('testAnswers') || '{}');

    if (savedAnswers[currentQuestionId] !== undefined) {
      this.testForm.get('question_' + currentQuestionId)?.setValue(savedAnswers[currentQuestionId]);
    } else {
      this.testForm.get('question_' + currentQuestionId)?.reset();
    }
  }

  submitTest() {
    console.log(this.testForm.getRawValue())

    this.learnerTestService.finishTest(this.testId, this.testForm.value.answers).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Тест завершен',
            detail: 'Ваши ответы успешно сохранены.'
          });
        }
      }, error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось завершить тест.'
        });
      }
    });

    this.clearTestState();
  }

  checkUnansweredQuestions() {
    this.displayAlertMessage = this.questions.some((question) => !this.answeredQuestions[question.id]);
  }

  clearTestState() {
    this.testForm.reset();
    localStorage.removeItem('testAnswers');
    localStorage.removeItem('answers');
    localStorage.removeItem('answeredQuestions');
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('isTestStarted');
    localStorage.removeItem('endsAt');
    this.currentQuestionIndex = 0;
    this.answeredQuestions = {}; // Очищаем состояние отвеченных вопросов
    this.isTestStarted = false;
    this.endTestVisible = false;
  }

  selectQuestion(index: number) {
    this.currentQuestionIndex = index;
    this.safeHtmlContent = this.sanitizeHtmlContent(this.questions[index].question);
    this.updateFormForCurrentQuestion(); // Обновляем форму при выборе вопроса
  }

  getTemaStatusIcon(status: string): string {
    if (status === 'passed') {
      return 'assets/images/finished.svg';
    } else if (status === 'passed-retake') {
      return 'assets/images/passed-retake.svg';
    } else if (status === 'opened') {
      return 'assets/images/opened.svg';
    } else if (status === 'expired') {
      return 'assets/images/expired.svg';
    } else if (status === 'opened_retake') {
      return 'assets/images/opened-retake.svg';
    } else {
      return 'assets/images/closed.svg';
    }
  }

  public viewResults(testId: number) {
    this.router.navigate([`/student/results/${testId}`]);
  }


  public back() {
    console.log(this.getLearnerTest)
    this.router.navigate([`/student/courses/${this.getLearnerTest.course_id}`]);
  }

  public calculateProgress() {
    const totalItems = this.lessonsAndTests.length;

    const passedItems = this.lessonsAndTests.filter(item => item.status === 'passed').length;

    if (totalItems > 0) {
      this.progress = (passedItems / totalItems) * 100;

      this.progressSegments = [];

      for (let i = 0; i < totalItems; i++) {
        this.progressSegments.push({
          filled: this.lessonsAndTests[i].status === 'passed'
        });
      }
    }
  }

  public getRouterLink(item: any) {
    if (item.status === 'passed' || item.status === 'opened') {
      if (item.type === 'test') {
        return ['/student/test', item.id];
      } else if (item.type === 'homework') {
        return ['/student/homework', item.id];
      } else {
        return ['/student/lesson', item.id];
      }
    }
    return null;
  }

  startTimer() {
    const now = new Date().getTime();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    // Проверяем, есть ли уже сохраненное время окончания (если тест перезагружался)
    const savedEndsAt = localStorage.getItem('endsAt');
    if (savedEndsAt) {
      this.endsAt = parseInt(savedEndsAt);
    }

    const timeUntilEnd = Math.round((this.endsAt - now) / 1000); // Округляем здесь
    this.remainingTime = Math.max(timeUntilEnd, 0); // Убедимся, что время не отрицательное

    this.timerInterval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateDisplayedTime();
      } else {
        this.endTest(); // Автоматически завершить тест
        clearInterval(this.timerInterval); // Остановить таймер
      }
    }, 1000); // Обновляем каждую секунду
  }

  updateDisplayedTime() {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = Math.round(this.remainingTime % 60);  // Здесь добавляем округление
    this.displayedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }


}
