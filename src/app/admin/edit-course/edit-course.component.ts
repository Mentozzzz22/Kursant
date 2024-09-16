import {Component, inject, input, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {ModuleService} from "../../service/module.service";
import {Module} from "../../../assets/models/module.interface";

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
export class EditCourseComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private moduleService = inject(ModuleService);
  private fb = inject(FormBuilder);
  public EditModuleVisible: boolean = false;
  public AddModuleVisible: boolean = false;
  public isModuleOpened: boolean = false;
  public modules: Module[] = []
  private courseId!: number;
  public selectedModuleId!: number;
  public addModuleForm!: FormGroup;
  public editModuleForm!: FormGroup;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.courseId = +params.get('courseId')!;
    });
    this.route.firstChild?.paramMap.subscribe(params => {
      this.isModuleOpened = !!params.get('moduleId');
    });
    this.initAddModuleForm();
    this.initEditModuleForm();
    this.loadModules()
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
        console.log(data)
      },
      error: (err) => {
        console.error('Ошибка при загрузке модулей курса:', err);
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

  public showEditDialog(moduleId: number) {
    this.EditModuleVisible = true;
    this.selectedModuleId = moduleId
  }

  public showAddDialog() {
    this.AddModuleVisible = true;
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

  deleteCourse() {
    // Logic to delete the course
  }

  editCourse() {
    // Logic to edit the course details
  }

  public navigateToCourses() {
    this.router.navigate(['/admin/course']);
  }

  public navigateToEditModule(moduleId: number) {
    this.router.navigate([`/admin/edit-course/${this.courseId}/edit-module`, moduleId]);
    this.isModuleOpened = true;
  }
}
