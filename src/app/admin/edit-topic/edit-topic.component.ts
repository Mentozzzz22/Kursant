import {Component, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {TopicService} from "../../service/topic.service";
import {Lesson} from "../../../assets/models/lesson.interface";
import {Answer, Question, Test} from "../../../assets/models/test.interface";
import {Homework} from "../../../assets/models/homework.interface";
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

type FormAnswer = FormGroup<{
  text: FormControl<string>
  is_correct: FormControl<boolean>
}>

type FormQuestion = FormGroup<{
  text: FormControl<string>;
  answers: FormArray<FormAnswer>;
}>

type Form = FormGroup<{
  duration: FormControl<number>;
  questions: FormArray<FormQuestion>
}>

@Component({
  selector: 'app-edit-topic',
  standalone: true,
  imports: [
    NgForOf,
    DialogModule,
    NgIf,
    ReactiveFormsModule,
    EditorModule
  ],
  templateUrl: './edit-topic.component.html',
  styleUrl: './edit-topic.component.css'
})
export class EditTopicComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  private fb = inject(NonNullableFormBuilder);
  private courseId!: number;
  private moduleId!: number;
  public topicId!: number;
  public selectedFile: File | null = null;
  public selectedFileName: string | undefined;
  public homeworkFile: File | null = null;
  public homeworkFileName: string | undefined;
  public homeworkDescription?: string;

  public lessons: Lesson[] = [];
  public test!: Test;
  public homework!: Homework;
  public AddLessonVisible: boolean = false;
  public addLessonForm!: FormGroup;

  public testForm: FormGroup = this.fb.group({
    duration: [null, Validators.required],
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

  private generateQuestion(questionData?: Question): FormQuestion {
    const defaultAnswers = new Array(4).fill({}).map((_, i) => {
      return {
        text: questionData?.answers[i]?.text || '',
        is_correct: questionData?.answers[i]?.is_correct || false
      };
    });

    return this.fb.group({
      text: [questionData?.text || '', Validators.required],
      answers: this.fb.array(defaultAnswers.map(answer => this.generateAnswer(answer)))
    });
  }

  private generateAnswer(answerData?: Answer): FormAnswer {
    return this.fb.group({
      text: [answerData?.text || '', Validators.required],
      is_correct: [answerData?.is_correct || false]
    });
  }

  public addQuestion() {
    this.questions().push(this.generateQuestion());
  }

  public deleteQuestion(index: number) {
    this.questions().removeAt(index);
  }

  public setCorrectAnswer(questionIndex: number, correctAnswerIndex: number): void {
    console.log(questionIndex, correctAnswerIndex)
    const answers = this.answers(questionIndex) as FormArray;
    answers.controls.forEach((ctrl, index) => {
      const ctrlIsCorrect = ctrl.get('is_correct') as FormControl;
      ctrlIsCorrect.setValue(index === correctAnswerIndex);
    });
  }

  public questions(): FormArray {
    return this.testForm.get('questions') as FormArray;
  }

  public answers(questionIndex: number): FormArray {
    return (this.questions().at(questionIndex) as FormGroup).get('answers') as FormArray;
  }

  private loadTopicContent() {
    this.topicService.getTopicContent(this.topicId).subscribe({
      next: (data) => {
        this.lessons = data.lessons;
        this.test = data.test;
        this.initializeForm(data.test);

        // Устанавливаем данные для домашнего задания
        this.homeworkFileName = data.homework.file;
        this.homeworkDescription = data.homework.description;

        // Обновляем описание в форме
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

  public deleteLesson(index: number) {
    this.lessons.splice(index, 1);
  }

  public deleteTopic(topicId: number) {
    this.topicService.deleteTopic(topicId).subscribe({
      next: () => {
        this.router.navigate([`/admin/edit-course/${this.courseId}/edit-module/${this.moduleId}`]);
      },
      error: (err) => {
        console.error('Ошибка при удалении модуля:', err);
      }
    });
  }

  public saveContent(): void {

    if (this.testForm.invalid) {
      console.error("Form is invalid");
      return;
    }

    const formData = new FormData();
    formData.append('topic_id', String(this.topicId));

    // Добавление уроков
    const lessonsData = this.lessons.map(lesson => ({
      name: lesson.name,
      file: lesson.file   // используется file_url вместо File объекта
    }));
    formData.append('lessons', JSON.stringify(lessonsData));

    // Добавление домашнего задания
    const homeworkData = {
      file: this.homeworkFileName,  // предполагается, что это строка URL
      description: this.homeworkDescription
    };
    formData.append('homework', JSON.stringify(homeworkData));

    // Добавление теста
    formData.append('test', JSON.stringify(this.testForm.value));

    // Отправка данных
    this.topicService.saveTopicContent(formData).subscribe({
      next: response => console.log('Content saved successfully:', response),
      error: error => console.error('Failed to save content:', error)
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
      this.lessons[index].file = input.files[0];
      console.log(this.lessons[index].file)
      this.selectedFile = input.files[0];
      this.selectedFileName = this.lessons[index].file.name;
      console.log(this.selectedFileName)
    }
  }

  // Метод для обработки выбора файла
  public onHomeworkFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.homeworkFile = element.files[0];
      this.homeworkFileName = this.homeworkFile.name;
      console.log('Homework file set:', this.homeworkFile);
      console.log('Homework file set:', this.homeworkFileName);
    }
  }

// Метод для программного триггера выбора файла
  public triggerHomeworkFileInput(): void {
    const fileInput = document.getElementById('homeworkFile') as HTMLInputElement;
    fileInput.click();
  }

}
