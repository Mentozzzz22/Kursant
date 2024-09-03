import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {StudentSidebarComponent} from "./student-sidebar/student-sidebar.component";

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [
    RouterModule,
    StudentSidebarComponent,
  ],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent {

}
