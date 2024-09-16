import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {kurs} from "../../non-authorized/main-page/main-page.component";
import {SuperAdminService} from "../../service/super-admin.service";
import {Courses} from "../../../assets/models/courses.interface";
import {DialogModule} from "primeng/dialog";
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {EditorModule} from "primeng/editor";

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
    NgIf
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent implements OnInit {
  activeTab: string = 'courseContent';
  private superAdminService = inject(SuperAdminService);
  private router = inject(Router);
  private fb = inject(FormBuilder)
  public selectedFileName: string | undefined;
  public selectedFile: File | null = null;
  public courses: Courses[] = [];
  public visibleAddModal: boolean = false;
  public productForm = this.fb.group({
    colors: this.fb.array([]),
  })

  flowWorks = [
    {
      stream: 1,
      date: '22.09.2024',
      title: 'ҰБТ-ға 3 профильді пән бойынша дайындық',
      tags: [
        { name: 'Физика | Ирисбеков Максат' },
        { name: 'Тарих | Ирисбеков Максат' },
        { name: 'Математика | Ирисбеков Максат' },
        { name: 'Информатика | Ирисбеков Максат' }
      ]
    },
    {
      stream: 2,
      date: '22.09.2024',
      title: 'ҰБТ-ға 3 профильді пән бойынша дайындық',
      tags: [
        { name: 'Физика | Ирисбеков Максат' },
        { name: 'Тарих | Ирисбеков Максат' },
        { name: 'Математика | Ирисбеков Максат' },
        { name: 'Информатика | Ирисбеков Максат' }
      ]
    },

  ];

  public kurstar: kurs[] = [
    {
      id: 1,
      img: 'assets/images/subject1.svg',
      subjectName: 'Қазақстан тарихы',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    }, {
      id: 2,
      img: 'assets/images/subject2.svg',
      subjectName: 'Математика',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    }, {
      id: 3,
      img: 'assets/images/subject3.svg',
      subjectName: 'Физика',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    }, {
      id: 4,
      img: 'assets/images/subject4.svg',
      subjectName: 'Информатика',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    }, {
      id: 5,
      img: 'assets/images/subject5.svg',
      subjectName: 'География',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    }, {
      id: 6,
      img: 'assets/images/subject6.svg',
      subjectName: 'Ағылшын тілі',
      bolim: 10,
      sabak: 70,
      closestPotok: '22/09/2024',
      price: 70000,
    },
  ]



  ngOnInit() {
    this.loadEmployees()
  }

  navigateToEditCourse(courseId: number): void {
    this.router.navigate(['/admin/edit-course', courseId]);
  }

  private loadEmployees() {
    this.superAdminService.getCourses().subscribe(data => {
      this.courses = data;
      console.log(data)
    })
  }

  public onCancel(): void {
    this.visibleAddModal = false;
  }

  public showAddDialog() {
    this.visibleAddModal = true;
  }

  public triggerFileInput(): void {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    fileInput.click();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}
