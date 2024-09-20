import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {CourseService} from "../../service/course.service";
import {DialogModule} from "primeng/dialog";
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {EditorModule} from "primeng/editor";
import {MessageService} from "primeng/api";
import {Course} from "../../../assets/models/course.interface";
import {FlowService} from "../../service/flow.service";
import {GetFlows} from "../../../assets/models/getFlows.interface";

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
    NgClass
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

  flowWorks = [
    {
      stream: 1,
      date: '22.09.2024',
      title: 'ҰБТ-ға 3 профильді пән бойынша дайындық',
      tags: [
        {name: 'Физика | Ирисбеков Максат'},
        {name: 'Тарих | Ирисбеков Максат'},
        {name: 'Математика | Ирисбеков Максат'},
        {name: 'Информатика | Ирисбеков Максат'}
      ]
    },
    {
      stream: 2,
      date: '22.09.2024',
      title: 'ҰБТ-ға 3 профильді пән бойынша дайындық',
      tags: [
        {name: 'Физика | Ирисбеков Максат'},
        {name: 'Тарих | Ирисбеков Максат'},
        {name: 'Математика | Ирисбеков Максат'},
        {name: 'Информатика | Ирисбеков Максат'}
      ]
    },

  ];


  ngOnInit() {
    this.loadFlows()
    this.loadCourses()

    this.courseService.courseUpdated$.subscribe(() => {
      this.loadCourses();
    });

    this.courseAddForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required]],
      discount_percentage: [1, [Validators.required]],
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
        poster: `http://127.0.0.1:8000${course.poster}`
      }));
    })
  }

  private loadFlows() {
    this.flowService.getFlows().subscribe(data => {
      this.flows = data
    })
  }

  public onSubmitAddCourse(): void {
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
        this.loadCourses();
      },
      error: (err) => {
        console.error('Error adding course:', err);
      }
    });
  }

  public onCancel(): void {
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
      console.log(this.selectedPosterFile.name)
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
}
