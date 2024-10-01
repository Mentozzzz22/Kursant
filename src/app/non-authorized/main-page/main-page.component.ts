import {Component, HostListener, inject, OnInit} from '@angular/core';
import {CardModule} from "primeng/card";
import {Button} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Course} from "../../../assets/models/course.interface";
import {CourseService} from "../../service/course.service";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {OrderService} from "../../service/order.service";
import {MessageService} from "primeng/api";
import {NgxMaskDirective} from "ngx-mask";
import {GetFlows} from "../../../assets/models/getFlows.interface";
import {FlowService} from "../../service/flow.service";
import {DialogModule} from "primeng/dialog";
import {Router} from "@angular/router";

export interface kurs {
  id: number,
  img: string,
  subjectName: string,
  bolim: number,
  sabak: number,
  closestPotok: string,
  progress?: number,
  price: number,
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CardModule,
    Button,
    InputTextModule,
    NgForOf,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgClass,
    NgIf,
    DialogModule,
    FormsModule,

  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements OnInit{
  courses: Course[] = [];
  public flows: GetFlows[] = [];
  isMobileView: boolean = false;
  private courseService = inject(CourseService);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private flowService = inject(FlowService);
  private router = inject(Router);
  public searchText: string = '';
  visible: boolean = false;

  @HostListener('window:resize', [])
  onResize() {
    this.checkWindowSize();
  }


  ngOnInit(): void {
    this.courseService.getSearchText().subscribe((searchText: string) => {
      this.searchText = searchText;
      this.loadCourses();
      this.loadFlows();
    });
    this.checkWindowSize();
  }

  loadCourses(): void {
    this.courseService.getCourses(this.searchText).subscribe(
      (data: Course[]) => {
        this.courses = data.map(course => ({
          ...course,
          poster: `http://127.0.0.1:8000/${course.poster}`
        }));
        if (this.searchText && this.searchText.trim() !== '') {
          const courseSection = document.querySelector('.kurstar');
          if (courseSection) {
            courseSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      },
      (error) => {
        console.error('Error fetching courses:', error);
      }
    );
  }

  executeSearch(): void {
      this.loadCourses();
      this.loadFlows();
  }

  loadFlows() {
    this.flowService.getFlows(this.searchText).subscribe(data => {
      this.flows = data
    })
  }


  public orderForm = this.fb.group({
    fullname: ['', Validators.required],
    phone_number: ['', Validators.required],
    courses: [[]]
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
          this.visible=false;
          this.orderForm.reset()
          this.messageService.add({severity:'success', summary:'Сәтті', detail:'Өтінім жіберілді'});
        },
        (error) => {
          console.error('Error submitting order', error);
          this.messageService.add({severity:'error', summary:'Сервер қатесі', detail:'Өтінім жіберілмеді'});
        }
      );
    } else {
      console.log('Form is invalid');
      this.messageService.add({severity:'info', summary:'Форма қатесі', detail:'Форма дұрыс толтырлмады'});

    }
  }

  addToCart(courseId: number): void {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.includes(courseId)) {
      cart.push(courseId);
      localStorage.setItem('cart', JSON.stringify(cart));

      this.orderService.updateCartCount(cart.length);

      this.messageService.add({severity: 'success', summary: 'Успех', detail: 'Курс успешно добавлен в корзину'});

    } else {
      this.messageService.add({severity: 'info', summary: 'Информация', detail: 'Курс уже находится в корзине'});
    }
  }

  checkWindowSize(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  showDialog() {
    this.visible = true;
  }

  openDetails(courseId: number) {
    this.router.navigate(['/about', courseId]);
  }


}
