import {Component, inject, OnInit} from '@angular/core';
import {LearnerCourseService} from "../../service/learner-course.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LearnerModules} from "../../../assets/models/learner_course.interface";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {CourseService} from "../../service/course.service";
import {ProgressBarModule} from "primeng/progressbar";
import {AdditionalCourse, CourseInfo, InfoModules} from "../../../assets/models/CourseInfo.interface";
import {OrderService} from "../../service/order.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-about-course-non-auth',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    ProgressBarModule
  ],
  templateUrl: './about-course-non-auth.component.html',
  styleUrl: './about-course-non-auth.component.css'
})
export class AboutCourseNonAuthComponent implements OnInit {

  private courseCourseService = inject(CourseService)
  private router = inject(Router)
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  public courseId!: number;
  public modules: InfoModules[] = []
  public additional_courses:AdditionalCourse[]=[]
  poster: string = '';
  public isOpen: boolean[] = [];
  public isOpenTopic: boolean[][] = [];
  public course: any = {};

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.courseId = +params.get('course_id')!;
      this.getCourse(this.courseId)
    });
  }

  public getCourse(courseId: number) {
    this.courseCourseService.getCourseNonAuth(courseId).subscribe((data) => {
      this.course = {
        course_id:data.course_id,
        name: data.name,
        modules_count: data.modules_count,
        lessons_count: data.lessons_count,
        teacherName: data.teacher_fullname,
        description:data.description,
        price:data.price,
      };

      this.modules = data.modules
      this.additional_courses = data.additional_courses
      this.poster = `http://127.0.0.1:8000${data.big_poster}`
      console.log('Poster URL:', this.modules);

      console.log('Data received:', data);
      this.isOpen = new Array(this.modules.length).fill(false);
      this.isOpenTopic = this.modules.map(module => new Array(module.topics.length).fill(false));
    })
  }

  toggleBolim(index: number) {
    this.isOpen[index] = !this.isOpen[index];
  }

  toggleTema(bolimIndex: number, temaIndex: number) {
    this.isOpenTopic[bolimIndex][temaIndex] = !this.isOpenTopic[bolimIndex][temaIndex];
  }

  addToCart(courseId: number): void {
    console.log(courseId);
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.includes(courseId)) {
      cart.push(courseId);
      localStorage.setItem('cart', JSON.stringify(cart));

      this.orderService.updateCartCount(cart.length);

      this.messageService.add({severity: 'success', summary: 'Сәттілік ', detail: 'Курс себетке сәтті қосылды'});

    } else {
      this.messageService.add({severity: 'info', summary: 'Ақпарат', detail: 'Курс уже находится в корзине'});
    }
  }

  getCoursePoster(posterPath: string): string {
    return `http://127.0.0.1:8000${posterPath}`;
  }

  navigateToCourseDetail(): void {
    this.router.navigate(['/course-detail', this.courseId]);
  }

}
