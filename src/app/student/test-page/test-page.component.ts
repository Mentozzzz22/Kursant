import {Component, inject, input, InputSignal, OnInit} from '@angular/core';
import {ProgressBarModule} from "primeng/progressbar";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {Button} from "primeng/button";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {MenuItem} from "primeng/api";
import {RadioButtonModule} from "primeng/radiobutton";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";

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


  public progress: number = 50;
  public startTestVisible: boolean = false;
  public endTestVisible: boolean = false;
  public isTestStarted: boolean = false; // Управление состоянием теста
  public currentQuestionIndex: number = 0; // Отслеживает текущий выбранный вопрос
  public questions: any[] = [];
  public answeredQuestions: { [key: number]: boolean } = {}; // Используем объект для хранения состояний
  public items: MenuItem[] | undefined;
  public testForm!: FormGroup;

  testId = input.required<string>()
  private fb = inject(FormBuilder)

  ngOnInit() {
    this.loadTest(this.testId);
    this.items = [
      {label: '< Қазақстан тарихы', route: '/#'},
      {label: 'Қазақстандағы ежелгі адамдардың өмірі', route: '/#'},
      {label: 'Қазақстан тарихын зерттеуші отандық тарихшылар', route: '/#'}
    ];
    this.initializeForm();
  }

  // Метод для инициализации формы с вопросами
  initializeForm() {
    const answersArray = this.testForm.get('answers') as FormArray;
    this.questions.forEach(question => {
      answersArray.push(this.fb.group({
        questionId: question.id,
        answerId: null // Ответ на вопрос
      }));
    });
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
  startTest() {
    this.isTestStarted = true;
    this.startTestVisible = false;
    localStorage.setItem('isTestStarted', 'true'); // Сохранение состояния теста
  }

  // Завершение теста
  endTest() {
    this.isTestStarted = false;
    this.endTestVisible = false;
    this.submitTest();
  }

  // Загрузка теста
  loadTest(testId: InputSignal<string>) {
    this.questions = this.getMockTestQuestions();
    this.answeredQuestions = new Array(this.questions.length).fill(false);

    this.testForm = this.fb.group({
      answers: this.fb.array([]) // FormArray для вопросов
    });

    this.questions.forEach((question) => {
      this.testForm.addControl(
        'question_' + question.id,
        this.fb.control(null, Validators.required)
      );
    });

    // Восстановление состояния теста после перезагрузки
    this.restoreSavedState();
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
      if (this.testForm.contains(controlName)) {
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
    if (this.testForm.valid) {
      console.log(this.testForm.value);
      const submittedAnswers = this.testForm.value.answers
        .filter((answer: any) => answer.answerId !== null); // Только заполненные ответы
      console.log('Submitted answers:', submittedAnswers);
    }

    const results: any = {};
    this.questions.forEach((question) => {
      results[question.id] = this.testForm.get('question_' + question.id)?.value;
    });
    console.log(this.testForm.getRawValue());
    localStorage.setItem('testResults', JSON.stringify(results));
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
  }

  selectQuestion(index: number) {
    this.currentQuestionIndex = index;
    this.updateFormForCurrentQuestion(); // Обновляем форму при выборе вопроса
  }

  getMockTestQuestions() {
    return [
      {
        id: 1,
        question: 'Сақтар туралы мәлімет беретін ежелгі мәтіндердің бірі?',
        options: [
          {
            answerId: 1,
            answerName: 'Ежелгі Қытай деректері'
          },
          {
            answerId: 2,
            answerName: 'Парсы патшаларының тасты сына жазбалары'
          },
          {
            answerId: 3,
            answerName: 'Араб саяхатшыларының деректері'
          },
          {
            answerId: 4,
            answerName: 'Орыс жылнамалары'
          }
        ],
      },
      {
        id: 2,
        question: 'Сақтар туралы мәлімет беретін ежелгі мәтіндердің бірі?',
        options: [
          {
            answerId: 1,
            answerName: 'Ежелгі Қытай деректері'
          },
          {
            answerId: 2,
            answerName: 'Парсы патшаларының тасты сына жазбалары'
          },
          {
            answerId: 3,
            answerName: 'Араб саяхатшыларының деректері'
          },
          {
            answerId: 4,
            answerName: 'Орыс жылнамалары'
          }
        ],
      },
      {
        id: 3,
        question: 'Сақтар туралы мәлімет беретін ежелгі мәтіндердің бірі?',
        options: [
          {
            answerId: 1,
            answerName: 'Ежелгі Қытай деректері'
          },
          {
            answerId: 2,
            answerName: 'Парсы патшаларының тасты сына жазбалары'
          },
          {
            answerId: 3,
            answerName: 'Араб саяхатшыларының деректері'
          },
          {
            answerId: 4,
            answerName: 'Орыс жылнамалары'
          }
        ],
      },
      {
        id: 4,
        question: 'Сақтар туралы мәлімет беретін ежелгі мәтіндердің бірі?',
        options: [
          {
            answerId: 1,
            answerName: 'Ежелгі Қытай деректері'
          },
          {
            answerId: 2,
            answerName: 'Парсы патшаларының тасты сына жазбалары'
          },
          {
            answerId: 3,
            answerName: 'Араб саяхатшыларының деректері'
          },
          {
            answerId: 4,
            answerName: 'Орыс жылнамалары'
          }
        ],
      },
      {
        id: 5,
        question: 'Сақтар туралы мәлімет беретін ежелгі мәтіндердің бірі?',
        options: [
          {
            answerId: 1,
            answerName: 'Ежелгі Қытай деректері'
          },
          {
            answerId: 2,
            answerName: 'Парсы патшаларының тасты сына жазбалары'
          },
          {
            answerId: 3,
            answerName: 'Араб саяхатшыларының деректері'
          },
          {
            answerId: 4,
            answerName: 'Орыс жылнамалары'
          }
        ],
      },
    ];
  }

  getTemaStatusIcon(status: string): string {
    if (status === 'finished') {
      return 'assets/images/finished.svg';
    } else if (status === 'opened') {
      return 'assets/images/opened.svg';
    } else {
      return 'assets/images/closed.svg';
    }
  }

  public sabaktar: any = [
    {id: 1, status: 'finished', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 2, status: 'finished', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 3, status: 'finished', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 4, status: 'opened', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 5, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 6, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 7, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 8, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'}
  ]
}
