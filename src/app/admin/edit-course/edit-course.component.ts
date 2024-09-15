import {Component} from '@angular/core';
import {NgForOf} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [
    NgForOf,
    DialogModule,
    FormsModule
  ],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.css'
})
export class EditCourseComponent {

  public EditModuleVisible: boolean = false;

  courseModules = [
    {id: 1, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 2, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 3, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 4, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    // more modules...
  ];

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
}
