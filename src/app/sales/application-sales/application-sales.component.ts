import {Component, inject, OnInit} from '@angular/core';
import {MessageService, PrimeTemplate} from "primeng/api";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {TableModule} from "primeng/table";
import {OrderService} from "../../service/order.service";
import {SalesApplication} from "../../../assets/models/salesApplication.interface";
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Course} from "../../../assets/models/course.interface";
import {CourseService} from "../../service/course.service";
import {UserService} from "../../service/user.service";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {DropdownModule} from "primeng/dropdown";

@Component({
  selector: 'app-application-sales',
  standalone: true,
  imports: [
    PrimeTemplate,
    RouterLink,
    RouterLinkActive,
    TableModule,
    NgClass,
    DialogModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    FormsModule,
    OverlayPanelModule,
    DropdownModule,
    NgStyle
  ],
  templateUrl: './application-sales.component.html',
  styleUrl: './application-sales.component.css'
})
export class ApplicationSalesComponent implements OnInit{
  private superAdminService = inject(CourseService);
  private courseService = inject(CourseService);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  status: string | null = null;
  courseId : number | null= null;
  learnerFullName:string|null=null;
  applications: SalesApplication[] = [];
  public coursesList: Course[] = [];
  visible: boolean = false;
  visibleAdd: boolean = false;
  public courses: Course[] = [];
  public selectedApplication: SalesApplication | null = null;
  activeStatus: string = '';
  searchText: string = '';
  rejection_reason!:string;
  selectedCourse: any = null;
  coursesAddList: Course[] = [];
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  comments:string = '';
  selectedApplicationType: any;
  isModalVisible: boolean = false;
  modalImageUrl: string | undefined = undefined;
  modalImageCaption: string | undefined = undefined;
  imageUrl: string | undefined = undefined;
  ngOnInit(): void {
    this.getApplications();
    this.loadCourses();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }


  public applicationsForm = this.fb.group({
    learner_fullname: [''],
    learner_phone_number: [''],
    learner_region: [''],
    course:[''],
    courses: this.fb.array([]),
    paid_check: [null as File | null],
    comments:['']});

  public applicationAddForm = this.fb.group({
    learner_fullname: [''],
    learner_phone_number: [''],
    learner_region: [''],
    course:[''],
    expires_at: [''],
    comments:['']});


  get isVisible(): boolean {
    return this.visible || this.visibleAdd;
  }

  set isVisible(value: boolean) {
    if (this.visible) {
      this.visible = value;
    } else if (this.visibleAdd) {
      this.visibleAdd = value;
    }
  }
  showAddDialog() {
    this.status = 'new';
    this.imageUrl = '';
    this.selectedFileName = '';
    this.visibleAdd  = true;
    this.loadCourses();
  }

  private loadCourses() {
    this.superAdminService.getCourses().subscribe(data => {
      this.courses = data.map((course: Course) => ({
        ...course,
        poster: `http://127.0.0.1:8000${course.poster}`
      }));
    })
  }

  get coursesFormArray(): FormArray {
    return this.applicationsForm.get('courses') as FormArray;
  }

  showDialog(application: SalesApplication) {
    this.visible  = true;
    this.loadCourses();
    this.coursesList = [];

    this.applicationsForm.reset();
    this.coursesFormArray.clear();

    this.orderService.getApplicationById(application.order_id).subscribe(data => {
      this.selectedApplication = data;
      this.selectedApplicationType = { ...application, showCancelReason: false };

      this.status = data.status;

      this.courseId = data.order_id;
      this.learnerFullName = data.learner_fullname;

      this.applicationsForm.patchValue({
        learner_fullname: data.learner_fullname,
        learner_phone_number: data.learner_phone_number,
        learner_region: data.learner_region,
        comments: data.comments,
        paid_check: data.paid_check as File | null
      });

      if (data.paid_check) {
        if (typeof data.paid_check === 'string') {
          const urlParts = data.paid_check.split('/');
          this.selectedFileName = urlParts[urlParts.length - 1];
          this.imageUrl = `http://127.0.0.1:8000${data.paid_check}`;
        } else if (data.paid_check instanceof File) {
          this.selectedFileName = data.paid_check.name;
        }
      } else {
        this.selectedFileName = 'Файл не выбран';
        this.imageUrl = undefined;
      }

      if (data.courses && data.courses.length > 0) {
        this.coursesList = data.courses.map((courseData) => {
          const matchedCourse = this.courses.find(course => course.id === courseData.course_id);
          if (matchedCourse) {
            const dateParts = courseData.expires_at.split('.');
            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            this.coursesFormArray.push(this.fb.control(formattedDate, Validators.required));

            return {
              ...matchedCourse,
              expires_at: formattedDate
            };
          }
          return null;
        }).filter(course => course !== null) as Course[];
      }
    });
  }


  addCourseToCart() {
    if (this.selectedCourse) {
      const rawExpiresAt = this.applicationAddForm.value.expires_at || '';
      const expiresAt = rawExpiresAt ? this.formatDate(rawExpiresAt) : '';

      const courseExists = this.coursesAddList.some(course => course.id === this.selectedCourse.id);

      if (courseExists) {
        this.messageService.add({
          severity: 'info',
          summary: 'Проверка',
          detail: 'Курс уже добавлен в корзину',
        });
      } else {
        this.coursesAddList.push({
          ...this.selectedCourse,
          expires_at: expiresAt
        });
      }

      this.selectedCourse = null;
    }
  }


  updateCourseExpiration(index: number) {
    const rawExpiresAt = this.applicationAddForm.value.expires_at;
    const expiresAt = rawExpiresAt ? this.formatDate(rawExpiresAt) : '';

    if (expiresAt && this.coursesAddList[index]) {
      this.coursesAddList[index].expires_at = expiresAt;
      console.log(`Updated course at index ${index} with expires_at:`, expiresAt);
    }
  }



  addCourseToUpdate() {
    if (this.selectedCourse) {
      const courseExists = this.coursesList.some(course => course.id === this.selectedCourse.id);

      if (courseExists) {
        this.messageService.add({
          severity: 'info',
          summary: 'Проверка',
          detail: 'Курс уже добавлен в корзину',
        });
      } else {
        this.coursesList.push(this.selectedCourse);

        if (this.selectedApplication) {
          this.selectedApplication.courses = this.selectedApplication.courses || [];
          this.selectedApplication.courses.push({
            course_id: this.selectedCourse.id,
            expires_at: ''
          });
          this.coursesFormArray.push(this.fb.control('', Validators.required));
        } else {
          console.error('Selected application is null.');
        }
      }
      this.selectedCourse = null;
    }
  }


  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.imageUrl = URL.createObjectURL(file);
    } else {
      console.error('No file was selected');
      this.selectedFileName = null;
    }
  }

  triggerFileInputFirst() {
    const fileInput = document.getElementById('fileInput1') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  triggerFileInputSecond() {
    const fileInput = document.getElementById('fileInput2') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  openModal(imageUrl: string, imageCaption: string) {
    this.modalImageUrl = imageUrl;
    this.modalImageCaption = imageCaption;
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  filterApplications(status: string) {
    this.activeStatus = status;
    this.getApplications(status, this.searchText);
  }

  searchApplications() {
    this.getApplications(this.activeStatus, this.searchText);
  }
  getApplications(status: string = '', search: string = '') {
    this.orderService.getApplications(status, search).subscribe(data => {
      this.applications = data.orders;
    });
  }



  saveDialog() {
    if (this.visible && this.selectedApplication) {
      const formData = this.applicationsForm.value;

      const form = new FormData();
      form.append('order_id', this.selectedApplication.order_id.toString());
      form.append('learner_fullname', formData.learner_fullname || '');
      form.append('learner_phone_number', formData.learner_phone_number || '');

      if (formData.learner_region) {
        form.append('learner_region', formData.learner_region);
      } else {
        form.append('learner_region', '');
      }

      form.append('comments', formData.comments || '');

      if (this.selectedFile) {
        form.append('paid_check', this.selectedFile);
      } else {
        console.error('No file for paid_check provided');
        return;
      }

      const coursesWithDates = this.selectedApplication.courses.map((course, index) => {
        const expiresAt = this.coursesFormArray.at(index).value;
        return {
          course_id: course.course_id,
          expires_at: this.formatDate(expiresAt)
        };
      });

      if (coursesWithDates.length > 0) {
        form.append('courses', JSON.stringify(coursesWithDates));
      } else {
        console.error("Courses are missing");
        return;
      }



      this.orderService.acceptSalesManagerOrder(form).subscribe(
        response => {
          this.visible = false;
          this.getApplications();
          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Заявка передано админу'
          });
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Произошла ошибка при сохранении заявки',
          });
        }
      );
    }

    if (this.visibleAdd) {
      const addFormData = this.applicationAddForm.value;

      const form = new FormData();
      form.append('learner_fullname', addFormData.learner_fullname || '');
      form.append('learner_phone_number', addFormData.learner_phone_number || '');

      if (addFormData.learner_region) {
        form.append('learner_region', addFormData.learner_region);
      } else {
        form.append('learner_region', '');
      }

      form.append('comments', addFormData.comments || '');

      if (this.selectedFile) {
        form.append('paid_check', this.selectedFile);
      } else {
        console.error('No valid paid_check file provided');
        return;
      }

      if (this.coursesAddList && this.coursesAddList.length > 0) {
        const courseData = this.coursesAddList.map(course => ({
          course_id: course.id,
          expires_at: this.formatDate(course.expires_at)
        }));
        form.append('courses', JSON.stringify(courseData));
      }



      this.orderService.acceptSalesManagerOrder(form).subscribe(
        response => {
          this.visibleAdd = false;
          this.getApplications();
          this.coursesAddList = [];
          this.applicationAddForm.reset();
          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Данные сохранены',
          });
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Произошла ошибка при сохранении формы',
          });
        }
      );
    }
  }

  saveCancelDialog() {
    if (this.selectedApplication) {
      const formData = this.applicationsForm.value;

      const payload = {
        order_id: this.selectedApplication.order_id.toString(),
        learner_fullname: formData.learner_fullname || '',
        learner_phone_number: formData.learner_phone_number || '',
        learner_region: formData.learner_region || '',
        rejection_reason: this.rejection_reason || ''
      };

      this.orderService.cancelSalesManagerOrder(payload).subscribe(
        response => {
          this.visible = false;
          this.getApplications();
          this.applicationsForm.reset()
          this.rejection_reason = '';
          this.messageService.add({
            severity: 'success',
            summary: 'Заявка отклонена',
            detail: 'Заявка успешно отклонена',
          });
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Произошла ошибка при отклонении заявки',
          });
        }
      );
    }
  }


  onDialogHide() {
    this.applicationsForm.reset();
    this.applicationAddForm.reset();
  }


  removeCourse(index: number) {
    this.coursesList.splice(index, 1);
    this.calculateTotalPrice();
  }

  removeAddCourse(index: number) {
    this.coursesAddList.splice(index, 1);
    this.calculateTotalPrice();
  }

  calculateTotalPrice(): number {
    return this.coursesList.reduce((total, course) => total + course.current_price, 0);
  }

  calculateTotalAddPrice(): number {
    return this.coursesAddList.reduce((total, course) => total + course.current_price, 0);
  }

  closeDialog() {
    this.visible  = false;
    this.visibleAdd = false;
    if (this.selectedApplication) {
      this.selectedApplicationType.showCancelReason = false;
    }
    this.messageService.add({severity:'info', summary:'Отмена', detail:'Никаких изменений'});
  }

  cancelDialog() {
    if (this.selectedApplication) {
      this.selectedApplicationType.showCancelReason = true;
      this.visibleAdd = false;
    }
  }
}
