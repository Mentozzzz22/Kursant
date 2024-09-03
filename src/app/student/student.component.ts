import { Component } from '@angular/core';
import {NavbarComponent} from "../navbar/navbar.component";
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-student',
  standalone: true,
    imports: [
        NavbarComponent,
      RouterModule,
    ],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent {

}
