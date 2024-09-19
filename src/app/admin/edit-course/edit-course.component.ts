import {Component, inject, input, OnDestroy, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {ModuleService} from "../../service/module.service";
import {Module} from "../../../assets/models/module.interface";
import {CourseService} from "../../service/course.service";
import {filter, Subscription} from "rxjs";

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [
    NgForOf,
    DialogModule,
    FormsModule,
    RouterOutlet,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.css'
})
export class EditCourseComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private moduleService = inject(ModuleService);
  private courseService = inject(CourseService);
  private fb = inject(FormBuilder);
  public EditModuleVisible: boolean = false;
  public AddModuleVisible: boolean = false;
  public isModuleOpened: boolean = false;
  public modules: Module[] = []
  public courseId!: number;
  public selectedModuleId!: number;
  public addModuleForm!: FormGroup;
  public editModuleForm!: FormGroup;
  public courseName!: string;
  private navigationSubscription: Subscription;

  constructor() {
    this.navigationSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkModuleOpened();
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.courseId = +params.get('courseId')!;
      this.loadModules()
    });

    this.moduleService.moduleUpdated$.subscribe(() => {
      this.loadModules();
    });

    this.initAddModuleForm();
    this.initEditModuleForm();
    this.checkModuleOpened();
  }

  private checkModuleOpened() {
    // Здесь мы проверяем URL или параметры роута, чтобы определить, должен ли быть открыт модуль
    this.isModuleOpened = this.route.firstChild != null;
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  private initAddModuleForm() {
    this.addModuleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Поле "Название модуля" обязательно
    });
  }

  private initEditModuleForm() {
    this.editModuleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Поле "Название модуля" обязательно
    });
  }

  public loadModules() {
    this.moduleService.getCourseModules(this.courseId).subscribe({
      next: (data) => {
        this.modules = data.modules;
        this.courseName = data.course.name
      },
      error: (err) => {
        console.error('Ошибка при загрузке модулей курса:', err);
      }
    });
  }

  public addModule() {
    if (this.addModuleForm.invalid) {
      return;
    }
    const newModule: Module = this.addModuleForm.value; // Получаем данные из формы
    this.moduleService.saveCourseModule(newModule, this.courseId).subscribe({
      next: () => {
        this.loadModules();
        this.AddModuleVisible = false;
        this.addModuleForm.reset();
      },
      error: (err) => {
        console.error('Ошибка при добавлении модуля:', err);
      }
    });
  }

  public editModule(moduleId: number) {
    if (this.editModuleForm.invalid) {
      return;
    }
    const updatedModule: Module = this.editModuleForm.value; // Получаем данные из формы
    updatedModule.id = moduleId;
    this.moduleService.saveCourseModule(updatedModule, this.courseId).subscribe({
      next: () => {
        this.loadModules();
        this.EditModuleVisible = false;
        this.editModuleForm.reset();
      },
      error: (err) => {
        console.error('Ошибка при редактировании модуля:', err);
      }
    });
  }

  public deleteCourse(courseId: number) {
    this.courseService.deleteCourse(courseId).subscribe({
      next: () => {
        this.router.navigate(['/admin/course']);
      },
      error: (err) => {
        console.error('Ошибка при удалении курса:', err);
      }
    });
  }

  public showEditDialog(moduleId: number, moduleName: string) {
    this.selectedModuleId = moduleId;
    this.editModuleForm.patchValue({
      name: moduleName
    });
    this.EditModuleVisible = true; // Показываем модалку
  }

  public showAddDialog() {
    this.AddModuleVisible = true;
  }

  public navigateToCourses() {
    this.router.navigate(['/admin/course']);
  }

  public navigateToEditModule(moduleId: number) {
    this.router.navigate([`/admin/edit-course/${this.courseId}/edit-module`, moduleId]);
    this.isModuleOpened = true;
  }
}
