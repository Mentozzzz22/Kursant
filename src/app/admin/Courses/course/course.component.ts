import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {CourseService} from "../../../service/course.service";
import {DialogModule} from "primeng/dialog";
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {EditorModule} from "primeng/editor";
import {ConfirmationService, MessageService} from "primeng/api";
import {Course} from "../../../../assets/models/course.interface";
import {FlowService} from "../../../service/flow.service";
import {GetFlows} from "../../../../assets/models/getFlows.interface";
import {ConfirmPopupModule} from "primeng/confirmpopup";
import {AutoExpandDirective} from "../../../auto-expand.directive";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgForOf,
    DialogModule,
    ReactiveFormsModule,
    EditorModule,
    NgIf,
    NgClass,
    ConfirmPopupModule,
    AutoExpandDirective
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent implements OnInit {

  private courseService = inject(CourseService);
  private flowService = inject(FlowService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder)
  private confirmationService = inject(ConfirmationService);
  public activeTab: string = 'courseContent';
  public selectedPosterName: string | undefined;
  public selectedBigPosterName: string | undefined;
  public selectedPosterFile: File | null = null;
  public selectedBigPosterFile: File | null = null;
  public visibleAddCourseModal: boolean = false;
  public visibleAddFlowModal: boolean = false;
  public courses: Course[] = [];
  public flows: GetFlows[] = [];
  public courseAddForm!: FormGroup;
  public flowAddForm!: FormGroup;
  public userUrl = environment.apiUrl
  ngOnInit() {
    this.loadFlows()
    this.loadCourses()

    this.courseService.courseUpdated$.subscribe(() => {
      this.loadCourses();
    });

    this.courseAddForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      discount_percentage: [null, [Validators.required, Validators.min(0),
        Validators.max(99), Validators.pattern("^[0-9]*$")]],
      teacher_fullname: ['', [Validators.required]],
      poster: [null, Validators.required],
      big_poster: [null, Validators.required]
    });

    this.flowAddForm = this.fb.group({
      name: ['', [Validators.required]],
      starts_at: ['', [Validators.required]],
    })
  }

  private loadCourses() {
    this.courseService.getCourses().subscribe(data => {
      this.courses = data.map((course: Course) => ({
        ...course,
        poster: `${this.userUrl}${course.poster}`
      }));
    })
  }

  private loadFlows() {
    this.flowService.getFlows().subscribe(data => {
      this.flows = data
    })
  }

  public onSubmitAddCourse(): void {
    console.log(this.courseAddForm.getRawValue())

    if (this.courseAddForm.valid) {

      const formData: FormData = new FormData();

      const posterFile = this.selectedPosterFile;
      const poster = this.courseAddForm.get('poster')?.value;

      if (posterFile) {
        formData.append('poster_uploaded_file', posterFile);
        formData.append('poster', 'poster_uploaded_file');
      } else if (poster && poster !== 'poster_uploaded_file') {
        formData.append('poster', poster);
      } else {
        console.error('Poster is required but not provided.');
        return;
      }

      const bigPosterFile = this.selectedBigPosterFile;
      const bigPoster = this.courseAddForm.get('big_poster')?.value;

      if (bigPosterFile) {
        formData.append('big_poster_uploaded_file', bigPosterFile);
        formData.append('big_poster', 'big_poster_uploaded_file');
      } else if (bigPoster && bigPoster !== 'big_poster_uploaded_file') {
        formData.append('big_poster', bigPoster);
      } else {
        console.error('Big poster is required but not provided.');
        return;
      }

      formData.append('name', this.courseAddForm.get('name')?.value);
      formData.append('description', this.courseAddForm.get('description')?.value);
      formData.append('price', this.courseAddForm.get('price')?.value);
      formData.append('discount_percentage', this.courseAddForm.get('discount_percentage')?.value);
      formData.append('teacher_fullname', this.courseAddForm.get('teacher_fullname')?.value);

      this.courseService.saveCourse(formData).subscribe({
        next: (response) => {
          this.visibleAddCourseModal = false;
          this.courseAddForm.reset()
          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Курс успешно создан!'
          });
          this.loadCourses();
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
    this.courseAddForm.reset();
    this.flowAddForm.reset();
    this.visibleAddCourseModal = false;
  }

  public showAddCourseDialog() {
    this.visibleAddCourseModal = true;
  }

  public showAddFlowDialog() {
    this.visibleAddFlowModal = true;
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
      this.courseAddForm.get('poster')?.setValue(this.selectedPosterFile);
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
      this.courseAddForm.get('big_poster')?.setValue(this.selectedBigPosterFile);
      this.messageService.add({
        severity: 'success',
        summary: 'Успешно',
        detail: `Файл: ${this.selectedBigPosterName} загружен!`
      });
    }
  }

  public setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  public navigateToEditCourse(courseId: number): void {
    this.router.navigate(['/admin/edit-course', courseId]);
  }

  public navigateToFlowDetails(flowId: number): void {
    this.router.navigate(['/admin/flow-details', flowId]);
  }

  public getFlowColorClass(flowId: number): string {
    const colors = ['flow-color-1', 'flow-color-2'];
    return colors[flowId];
  }

  public onSubmitAddFlow() {
    if (!this.flowAddForm.valid) {
      this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Необходимо заполнить все поля!'});
      return;
    }

    const formattedDate = this.formatDate(this.flowAddForm.get('starts_at')!.value);

    const flowData = {
      name: this.flowAddForm.get('name')!.value,
      starts_at: formattedDate
    };

    this.flowService.saveFlow(flowData).subscribe({
      next: (response) => {
        this.flowAddForm.reset()
        this.visibleAddFlowModal = false;
        this.messageService.add({severity: 'success', summary: 'Успех', detail: 'Поток успешно добавлен'});
        this.loadFlows();
      },
      error: (error) => {
        this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Ошибка при добавлении потока'});
      }
    });
  }

  private formatDate(dateStr: string): string {
    const [datePart, timePart] = dateStr.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}.${month}.${year}`;
  }

  public removeFlow(event: Event, flowId: number): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Вы действительно хотите удалить этот поток?',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Нет',
      acceptLabel: 'Да',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.flowService.deleteFlow(flowId).subscribe({
          next: () => {
            this.flows = this.flows.filter(flow => flow.flow_id !== flowId); // Удаление потока из списка на клиенте
            this.messageService.add({
              severity: 'success',
              summary: 'Успешно',
              detail: 'Поток успешно удален!'
            });
          },
          error: (error) => {
            if (error.status === 409) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Ошибка',
                detail: 'Нельзя удалить данный поток'
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: 'Ошибка при удалении потока'
              });
            }
          }
        });
      }
    });
  }

  public onSearch(): void {
    const searchText = (document.getElementById('supplierSearch') as HTMLInputElement).value;
    if (this.activeTab === 'courseContent') {
      this.courseService.getCourses(searchText).subscribe({
        next: (courses) => {
          this.courses = courses;
          this.messageService.add({
            severity: 'info',
            summary: 'Результаты поиска',
            detail: `Найдено курсов: ${courses.length}`
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка поиска',
            detail: 'Произошла ошибка при поиске курсов'
          });
        }
      });
    } else if (this.activeTab === 'flowWorks') {
      this.flowService.getFlows(searchText).subscribe({
        next: (flows) => {
          this.flows = flows;
          this.messageService.add({
            severity: 'info',
            summary: 'Результаты поиска',
            detail: `Найдено потоков: ${flows.length}`
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка поиска',
            detail: 'Произошла ошибка при поиске потоков'
          });
        }
      });
    }
  }

}
