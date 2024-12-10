import {Component, HostListener, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {kurs} from "../../non-authorized/main-page/main-page.component";
import {ProgressBarModule} from "primeng/progressbar";
import {Router} from "@angular/router";
import {LearnerCourseService} from "../../service/learner-course.service";
import {LearnerCourses, OtherCourses} from "../../../assets/models/learner_courses.interface";
import {DialogModule} from "primeng/dialog";
import {FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {NgxMaskDirective} from "ngx-mask";
import {OrderService} from "../../service/order.service";
import {MessageService} from "primeng/api";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    NgForOf,
    ProgressBarModule,
    NgIf,
    DialogModule,
    FormsModule,
    InputTextModule,
    NgxMaskDirective,
    ReactiveFormsModule
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  isMobileView: boolean = false;
  visible: boolean = false;
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  @HostListener('window:resize', [])
  onResize() {
    this.checkWindowSize();
  }
  public userUrl = environment.apiUrl
  private learnerCourseService = inject(LearnerCourseService)
  private router = inject(Router);


  public learnerCourses: LearnerCourses[] = [];
  public otherCourses: OtherCourses[] = [];

  ngOnInit() {
    this.getCourses()
    this.checkWindowSize();
  }

  public getCourses() {
    this.learnerCourseService.getCourses().subscribe(
      (data: { learner_courses: LearnerCourses[]; other_courses: OtherCourses[] }) => {
        this.learnerCourses = data.learner_courses.map(course => ({
          ...course,
          poster: `${this.userUrl}/media/${course.poster}`
        }));

        this.otherCourses = data.other_courses.map(course => ({
          ...course,
          poster: `${this.userUrl}/media/${course.poster}`
        }));

        console.log('Learner Courses:', this.learnerCourses);
        console.log('Other Courses:', this.otherCourses);
      },
      (error) => {
        console.error('Error fetching courses:', error);
      }
    );
  }

  public orderForm = this.fb.group({
    fullname: ['', Validators.required],
    phone_number: ['', Validators.required],
    courses: this.fb.array([], Validators.required)
  });

  submitOrder(): void {
    let phone = this.orderForm.get('phone_number')?.value;

    if (phone) {
      phone = phone.replace(/\D/g, '');
      phone = `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`;
      this.orderForm.get('phone_number')?.setValue(phone);
    }

    if (this.orderForm.valid) {
      this.orderService.makeOrder(this.orderForm.value).subscribe(
        (response) => {
          this.visible = false;
          this.orderForm.reset();
          this.messageService.add({ severity: 'success', summary: 'Сәтті', detail: 'Өтінім жіберілді' });
        },
        (error) => {
          console.error('Error submitting order', error);
          this.messageService.add({ severity: 'error', summary: 'Сервер қатесі', detail: 'Өтінім жіберілмеді' });
        }
      );
    } else {
      console.log('Form is invalid');
      this.messageService.add({ severity: 'info', summary: 'Форма қатесі', detail: 'Форма дұрыс толтырлмады' });
    }
  }

  get courses(): FormArray {
    return this.orderForm.get('courses') as FormArray;
  }

  showDialog(courseId: number) {
    this.addCourse(courseId);
    this.visible = true;
  }

  addCourse(courseId: number) {
    if (!this.courses.value.includes(courseId)) {
      this.courses.push(this.fb.control(courseId));
    }
  }

  checkWindowSize(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  goToCourse(courseId: number): void {
    this.router.navigate(['/student/courses', courseId]);
  }
}
