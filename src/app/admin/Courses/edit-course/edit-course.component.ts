import {Component, inject, input, OnDestroy, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {ModuleService} from "../../../service/module.service";
import {Module} from "../../../../assets/models/module.interface";
import {CourseService} from "../../../service/course.service";
import {filter, Subscription} from "rxjs";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmPopupModule} from "primeng/confirmpopup";
import {Course} from "../../../../assets/models/course.interface";
import {AutoExpandDirective} from "../../../auto-expand.directive";
import {EditorModule} from "primeng/editor";

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [
    NgForOf,
    DialogModule,
    FormsModule,
    RouterOutlet,
    NgIf,
    ReactiveFormsModule,
    ConfirmPopupModule,
    AutoExpandDirective,
    EditorModule
  ],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.css'
})
export class EditCourseComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private moduleService = inject(ModuleService);
  private courseService = inject(CourseService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  public EditModuleVisible: boolean = false;
  public EditCourseVisible: boolean = false;
  public AddModuleVisible: boolean = false;
  public isModuleOpened: boolean = false;
  public modules: Module[] = []
  public courseId!: number;
  public selectedModuleId!: number;
  public selectedCourseId!: number;
  public addModuleForm!: FormGroup;
  public editModuleForm!: FormGroup;
  public editCourseForm!: FormGroup;
  public courseName!: string;
  private course!: Course;
  public selectedPosterName: string | undefined;
  public selectedBigPosterName: string | undefined;
  public selectedPosterFile: File | null = null;
  public selectedBigPosterFile: File | null = null;
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
      this.getCourse(this.courseId)
    });

    this.moduleService.moduleUpdated$.subscribe(() => {
      this.loadModules();
    });

    this.initAddModuleForm();
    this.initEditModuleForm();
    this.checkModuleOpened();
    this.editCourseForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      discount_percentage: [null, [Validators.required, Validators.min(0),
        Validators.max(99), Validators.pattern("^[0-9]*$")]],
      teacher_fullname: ['', [Validators.required]],
      poster: [null, Validators.required],
      big_poster: [null, Validators.required]
    });
  }

  public getCourse(courseId: number) {
    this.courseService.getCourse(courseId).subscribe(data => {
      this.course = data

      // Обновляем значения формы с данными курса
      this.editCourseForm.patchValue({
        name: this.course.name,
        description: this.course.description,
        price: this.course.price,
        discount_percentage: this.course.discount_percentage,
        teacher_fullname: this.course.teacher_fullname,
        poster: this.course.poster,
        big_poster: this.course.big_poster
      });

      // Устанавливаем имена постеров в UI
      this.selectedPosterName = this.course.poster ? this.course.poster.split('/').pop() : undefined;
      this.selectedBigPosterName = this.course.big_poster ? this.course.big_poster.split('/').pop() : undefined;
    });
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

  public deleteCourse(event: Event, courseId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Вы действительно хотите удалить этот курс?',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Нет',
      acceptLabel: 'Да',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.courseService.deleteCourse(courseId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Успешно',
              detail: 'Курс успешно удален!'
            });
            this.router.navigate(['/admin/course']);
          },
          error: (error) => {
            if (error.status === 409) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Ошибка',
                detail: 'Нельзя удалить данный курс'
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: 'Ошибка при удалении курса'
              });
            }
          }

        });
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

  public showEditCourseDialog() {
    this.EditCourseVisible = true;
  }

  public navigateToCourses() {
    const flowId = this.route.snapshot.queryParamMap.get('flowId');
    console.log(flowId);
    if (flowId) {
      this.router.navigate([`/admin/flow-details/${flowId}/`]);
    } else {
      this.router.navigate(['/admin/course']);
    }
  }

  public navigateToEditModule(moduleId: number) {
    this.router.navigate([`/admin/edit-course/${this.courseId}/edit-module`, moduleId]);
    this.isModuleOpened = true;
  }

  public triggerFileInput(fileInputId: string): void {
    const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  public onPosterSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPosterFile = input.files[0];
      this.selectedPosterName = this.selectedPosterFile.name;
      console.log(this.selectedPosterFile.name)
      this.editCourseForm.get('poster')?.setValue(this.selectedPosterFile);
      this.messageService.add({
        severity: 'success',
        summary: 'Успешно',
        detail: `Файл: ${this.selectedPosterName} загружен!`
      });
    }
  }

  public onBigPosterSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedBigPosterFile = input.files[0];
      this.selectedBigPosterName = this.selectedBigPosterFile.name;
      this.editCourseForm.get('big_poster')?.setValue(this.selectedBigPosterFile);
      this.messageService.add({
        severity: 'success',
        summary: 'Успешно',
        detail: `Файл: ${this.selectedBigPosterName} загружен!`
      });
    }
  }

  public onSubmitAddCourse(): void {
    if(this.editCourseForm.valid) {

      const formData: FormData = new FormData();
      const courseId = this.courseId
      formData.append('id', courseId.toString());
      const posterFile = this.selectedPosterFile;
      const poster = this.editCourseForm.get('poster')?.value;
      console.log(this.editCourseForm.get('poster')?.value)

      if (posterFile) {
        formData.append('poster_uploaded_file', posterFile);
        formData.append('poster', 'poster_uploaded_file');
      } else if (poster && poster !== 'poster_uploaded_file') {
        formData.append('poster', poster);
      } else {
        return;
      }

      const bigPosterFile = this.selectedBigPosterFile;
      const bigPoster = this.editCourseForm.get('big_poster')?.value;

      if (bigPosterFile) {
        formData.append('big_poster_uploaded_file', bigPosterFile);
        formData.append('big_poster', 'big_poster_uploaded_file');
      } else if (bigPoster && bigPoster !== 'big_poster_uploaded_file') {
        formData.append('big_poster', bigPoster);
      } else {
        console.error('Big poster is required but not provided.');
        return;
      }

      formData.append('name', this.editCourseForm.get('name')?.value);
      formData.append('description', this.editCourseForm.get('description')?.value);
      formData.append('price', this.editCourseForm.get('price')?.value);
      formData.append('discount_percentage', this.editCourseForm.get('discount_percentage')?.value);
      formData.append('teacher_fullname', this.editCourseForm.get('teacher_fullname')?.value);

      this.courseService.saveCourse(formData).subscribe({
        next: (response) => {
          this.EditCourseVisible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Курс успешно изменен!'
          });
          this.loadModules();
        },
        error: (err) => {
          console.error('Error adding course:', err);
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Заполните все поля!'
      });
    }
  }

  public onCancel(): void {
    this.EditCourseVisible = false;
  }
}
