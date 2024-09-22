import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {StudentSidebarComponent} from "./student-sidebar/student-sidebar.component";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [
    RouterModule,
    StudentSidebarComponent,
    NgClass,
  ],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent {
  isSidebarExpanded = false;

  onSidebarToggled(isExpanded: boolean) {
    this.isSidebarExpanded = isExpanded;
  }
}
