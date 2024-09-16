import {Component, inject, input, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [
    NgForOf,
    DialogModule,
    FormsModule,
    RouterOutlet,
    NgIf
  ],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.css'
})
export class EditCourseComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private courseId!: number;
  public EditModuleVisible: boolean = false;
  public isModuleOpened: boolean = false;

  courseModules = [
    {id: 1, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 2, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 3, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 4, name: 'Казақстандағы ежелгі адамдардың өмірі'},
  ];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.courseId = +params.get('courseId')!;
    });
    this.route.firstChild?.paramMap.subscribe(params => {
      this.isModuleOpened = !!params.get('moduleId');
    });
  }

  public showEditDialog() {
    this.EditModuleVisible = true;
  }

  addModule() {
    // Logic to add a module
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
