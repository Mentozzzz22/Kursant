import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Location, NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {TopicService} from "../../service/topic.service";
import {Topic} from "../../../assets/models/topic.interface";
import {Module} from "../../../assets/models/module.interface";
import {ModuleService} from "../../service/module.service";
import {filter, Subscription} from "rxjs";

@Component({
  selector: 'app-edit-module',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    NgForOf,
    NgIf,
    RouterOutlet,
    ReactiveFormsModule
  ],
  templateUrl: './edit-module.component.html',
  styleUrl: './edit-module.component.css'
})
export class EditModuleComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  private moduleService = inject(ModuleService);
  private fb = inject(FormBuilder);

  public EditTopicVisible: boolean = false;
  public AddTopicVisible: boolean = false;
  public isTopicOpened: boolean = false;
  public topics: Topic[] = []; // Для хранения тем модуля
  public courseId!: number;
  public moduleId!: number;
  public selectedTopicId!: number;
  public topicName: string = '';
  public addTopicForm!: FormGroup;
  public editTopicForm!: FormGroup;

  private navigationSubscription: Subscription;

  constructor() {
    // Подписываемся на события роутера
    this.navigationSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkTopicOpened();
    });
  }


  ngOnInit() {
    this.route.parent!.paramMap.subscribe(params => {
      this.courseId = +params.get('courseId')!;
    });

    this.route.paramMap.subscribe(params => {
      this.moduleId = +params.get('moduleId')!;
      this.loadTopics();
    });

    this.initAddTopicForm();
    this.initEditTopicForm();
    this.checkTopicOpened();
  }

  private checkTopicOpened() {
    // Здесь мы проверяем URL или параметры роута, чтобы определить, должен ли быть открыт модуль
    this.isTopicOpened = this.route.firstChild != null;
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  private initAddTopicForm() {
    this.addTopicForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Поле "Название модуля" обязательно
    });
  }

  private initEditTopicForm() {
    this.editTopicForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Поле "Название модуля" обязательно
    });
  }

  public loadTopics() {
    this.topicService.getTopics(this.moduleId).subscribe({
      next: (data) => {
        this.topics = data.topics;
      },
      error: (err) => {
        console.error('Ошибка при загрузке тем:', err);
      }
    });
  }

  public addTopics() {
    if (this.addTopicForm.invalid) {
      return;
    }
    const newTopic: Topic = this.addTopicForm.value; // Получаем данные из формы
    this.topicService.saveTopic(newTopic, this.moduleId).subscribe({
      next: () => {
        this.loadTopics();
        this.AddTopicVisible = false;
        this.addTopicForm.reset();
      },
      error: (err) => {
        console.error('Ошибка при добавлении темы:', err);
      }
    });
  }

  public editTopic(topicId: number) {
    if (this.editTopicForm.invalid) {
      return;
    }
    const updatedTopic: Topic = this.editTopicForm.value;
    updatedTopic.id = topicId;
    this.topicService.saveTopic(updatedTopic, this.moduleId).subscribe({
      next: () => {
        this.loadTopics();
        this.EditTopicVisible = false;
        this.editTopicForm.reset();
      },
      error: (err) => {
        console.error('Ошибка при редактировании темы:', err);
      }
    });
  }

  public deleteModule(moduleId: number) {
    this.moduleService.deleteCourseModule(moduleId).subscribe({
      next: () => {
        this.loadTopics(); // Перезагружаем модули после удаления
      },
      error: (err) => {
        console.error('Ошибка при удалении модуля:', err);
      }
    });
    this.router.navigate([`/admin/edit-course/${this.courseId}`]);
  }

  public showEditDialog(topicId: number, topicName: string) {
    this.selectedTopicId = topicId;
    this.editTopicForm.patchValue({
      name: topicName
    });
    this.EditTopicVisible = true;
  }

  public showAddDialog() {
    this.AddTopicVisible = true;
  }

  public back() {
    console.log(this.courseId + 'edit-module')
    this.router.navigate([`/admin/edit-course/${this.courseId}`]);
  }

  public navigateToEditTema(topicId: number) {
    this.router.navigate([`/admin/edit-course/${this.courseId}/edit-module/${this.moduleId}/edit-topic/`, topicId]);
    this.isTopicOpened = true;
  }
}
