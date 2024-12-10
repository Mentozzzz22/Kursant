import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {DecimalPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {kurs} from "../main-page/main-page.component";
import {CourseService} from "../../service/course.service";
import {Course} from "../../../assets/models/course.interface";
import {OrderService} from "../../service/order.service";
import {ConfirmationService, MessageService, PrimeTemplate} from "primeng/api";
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgxMaskDirective} from "ngx-mask";
import {ConfirmPopup, ConfirmPopupModule} from "primeng/confirmpopup";
import {Button} from "primeng/button";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgForOf,
    DialogModule,
    PrimeTemplate,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    DecimalPipe,
    ConfirmPopupModule,
    Button,
    NgClass,
    NgIf
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit{

  @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;
  public userUrl = environment.apiUrl
  courses: Course[] = [];
  private courseService = inject(CourseService);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  totalCurrentPrice: number = 0;
  public searchText: string = '';
  totalOldPrice: number = 0;
  visible: boolean = false;

  ngOnInit(): void {
    this.courseService.getSearchText().subscribe((searchText: string) => {
      this.searchText = searchText;
      this.loadCourses()
    });

  }

  loadCourses(): void {
    const cartIds = JSON.parse(localStorage.getItem('cart') || '[]');

    if (cartIds.length > 0) {
      this.courseService.getCourses(this.searchText, cartIds).subscribe(
        (data: Course[]) => {
          this.courses = data.map(course => ({
            ...course,
            poster: `${this.userUrl}${course.poster}`
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

  openDetails(courseId: number) {
    this.router.navigate(['/about', courseId]);
  }

  removeFromCart(courseId: number|undefined): void {
    let cartIds = JSON.parse(localStorage.getItem('cart') || '[]');

    cartIds = cartIds.filter((id: number) => id !== courseId);

    localStorage.setItem('cart', JSON.stringify(cartIds));

    this.courses = this.courses.filter(course => course.id !== courseId);

    this.orderService.updateCartCount(cartIds.length);

    this.messageService.add({severity: 'success', summary: 'Жетістік', detail: 'Курс Себеттен алынып тасталды.'});

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
      .filter((id): id is number => id !== undefined);

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

  transform(value: number | string): string {
    if (value === null || value === undefined) {
      return '';
    }

    return value
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  cancelDialog(){
    this.visible = false;
    this.messageService.add({severity:'custom', summary:'Бас тарту', detail:'Өтінім қабылданбады',icon: 'pi-file-excel'});
  }

  confirm(event: Event, courseId:number|undefined) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Сіз жалғастырғыңыз келетініне сенімдісіз бе?',
      accept: () => {
        this.removeFromCart(courseId);
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Қабылданбады', detail: 'Сіз бас тарттыңыз', life: 3000 });
      }
    });
  }

  accept() {
    this.confirmPopup.accept();
  }

  reject() {
    this.confirmPopup.reject();
  }
}
