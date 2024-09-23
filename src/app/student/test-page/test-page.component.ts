import {Component, inject, input, InputSignal, OnInit} from '@angular/core';
import {ProgressBarModule} from "primeng/progressbar";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {Button} from "primeng/button";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
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
import {LearnerQuestions} from "../../../assets/models/getLearnerQuestions.interface";

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
    RadioButtonModule
  ],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.css'
})
export class TestPageComponent implements OnInit {

  private learnerTestService = inject(LearnerTestService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private messageService = inject(MessageService);

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
  public answeredQuestions: { [key: number]: boolean } = {}; // Используем объект для хранения состояний
  public testForm!: FormGroup;
  public testId!: number;
  public getLearnerTest!: getLearnerTest;
  public learnerTest!: Testing;
  public testStatus!: string;

  private fb = inject(FormBuilder)

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.testId = +params.get('testId')!;
      this.loadTest(this.testId);
    });
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
      this.calculateProgress();
    })

    // this.questions = this.getMockTestQuestions();
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
      this.initializeForm()
      console.log(this.questions)
    });
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
      this.testForm.addControl(
        'question_' + question.id,
        this.fb.control(null, Validators.required)
      );
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
    this.endTestVisible = true;
  }

  // Старт теста
  startTest(testId: number): void {
    this.learnerTestService.startTest(testId).subscribe(
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
  endTest() {
    this.isTestStarted = false;
    this.endTestVisible = false;
    this.submitTest();
  }

  // Сохранение ответа при выборе варианта
  saveAnswer(questionId: number, answerId: number) {
    let savedAnswers = JSON.parse(localStorage.getItem('testAnswers') || '{}');
    savedAnswers[questionId] = answerId; // Сохраняем ответ для конкретного вопроса
    localStorage.setItem('testAnswers', JSON.stringify(savedAnswers));

    this.answeredQuestions[questionId] = true; // Отмечаем вопрос как отвеченный
    localStorage.setItem('answeredQuestions', JSON.stringify(this.answeredQuestions));

    const answersArray = this.answersFormArray;
    const questionGroup = answersArray.controls.find(control => control.value.questionId === questionId) as FormGroup;

    if (questionGroup) {
      questionGroup.patchValue({answerId: answerId});
      this.answeredQuestions[questionId] = true;
    }
  }


  // Восстановление сохраненных ответов и состояния
  restoreSavedState() {
    const savedAnswers = JSON.parse(localStorage.getItem('testAnswers') || '{}');
    const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '{}');

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
  }

// Обновление формы при переключении вопросов
  updateFormForCurrentQuestion() {
    const currentQuestionId = this.questions[this.currentQuestionIndex].id;
    const savedAnswers = JSON.parse(localStorage.getItem('testAnswers') || '{}');

    // Проверяем, есть ли ответ на текущий вопрос
    if (savedAnswers[currentQuestionId] !== undefined) {
      this.testForm.get('question_' + currentQuestionId)?.setValue(savedAnswers[currentQuestionId]);
    } else {
      this.testForm.get('question_' + currentQuestionId)?.reset();
    }
  }

  submitTest() {

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

  clearTestState() {
    this.testForm.reset();
    localStorage.removeItem('testAnswers');
    localStorage.removeItem('answeredQuestions');
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('isTestStarted');
    this.currentQuestionIndex = 0;
    this.answeredQuestions = {}; // Очищаем состояние отвеченных вопросов
    this.isTestStarted = false;
    this.endTestVisible = false;
    this.loadTest(this.testId);
  }

  selectQuestion(index: number) {
    this.currentQuestionIndex = index;
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
    const totalLessons = this.lessons.length; // Общее количество уроков
    const passedLessons = this.lessons.filter(lesson => lesson.status === 'passed').length; // Количество пройденных уроков

    // Вычисляем процент
    if (totalLessons > 0) {
      this.progress = (passedLessons / totalLessons) * 100;
    }
  }

}
