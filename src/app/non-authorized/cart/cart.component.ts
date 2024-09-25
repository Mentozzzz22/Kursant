import {Component, inject, OnInit} from '@angular/core';
import {NgForOf} from "@angular/common";
import {kurs} from "../main-page/main-page.component";
import {CourseService} from "../../service/course.service";
import {Course} from "../../../assets/models/course.interface";
import {OrderService} from "../../service/order.service";
import {MessageService, PrimeTemplate} from "primeng/api";
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgxMaskDirective} from "ngx-mask";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgForOf,
    DialogModule,
    PrimeTemplate,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit{
  courses: Course[] = [];
  private courseService = inject(CourseService);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  totalCurrentPrice: number = 0;
  totalOldPrice: number = 0;
  visible: boolean = false;

  ngOnInit(): void {
    this.loadCourses()
  }

  loadCourses(): void {
    const cartIds = JSON.parse(localStorage.getItem('cart') || '[]');

    if (cartIds.length > 0) {
      this.courseService.getCourses(undefined, cartIds).subscribe(
        (data: Course[]) => {
          this.courses = data.map(course => ({
            ...course,
            poster: `http://127.0.0.1:8000${course.poster}`
          }));

          this.calculateTotalPrices();
        },
        (error) => {
          console.error('Error fetching courses:', error);
        }
      );
    } else {
      console.log('Корзина пуста');
    }
  }

  removeFromCart(courseId: number): void {
    let cartIds = JSON.parse(localStorage.getItem('cart') || '[]');

    cartIds = cartIds.filter((id: number) => id !== courseId);

    localStorage.setItem('cart', JSON.stringify(cartIds));

    this.courses = this.courses.filter(course => course.id !== courseId);

    this.orderService.updateCartCount(cartIds.length);

    this.messageService.add({severity: 'success', summary: 'Успех', detail: 'Курс удален из корзины.'});

    this.calculateTotalPrices();

  }

  calculateTotalPrices(): void {
    this.totalCurrentPrice = this.courses.reduce((acc, course) => acc + course.current_price, 0);
    this.totalOldPrice = this.courses.reduce((acc, course) => acc + course.price, 0);
  }

  showDialog() {
    this.visible = true;
  }

  public orderForm = this.fb.group({
    fullname: ['', Validators.required],
    phone_number: ['', Validators.required],
    courses: [[] as number[]]
  });


  submitOrder(): void {
    const courseIds = this.courses
      .map(course => course.id)
      .filter((id): id is number => id !== undefined); // Фильтруем undefined значения

    this.orderForm.patchValue({
      courses: courseIds
    });

    let phone = this.orderForm.get('phone_number')?.value;

    if (phone) {
      phone = phone.replace(/\D/g, '');
      phone = `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`;
      this.orderForm.get('phone_number')?.setValue(phone);
    }

    if (this.orderForm.valid) {
      this.orderService.makeOrder(this.orderForm.value).subscribe(
        (response) => {
          this.messageService.add({ severity: 'success', summary: 'Сәтті', detail: 'Өтінім жіберілді' });

          this.orderForm.reset();

          localStorage.removeItem('cart');
          this.courses = [];

          this.orderService.updateCartCount(0);

          this.totalCurrentPrice = 0;
          this.totalOldPrice = 0;

          this.visible = false;
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

  cancelDialog(){
    this.visible = false;
    this.messageService.add({severity:'custom', summary:'Отклонить', detail:'Заявка отклонена',icon: 'pi-file-excel'});
  }
}
