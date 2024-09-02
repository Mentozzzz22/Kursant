import { Component } from '@angular/core';
import {InputTextModule} from "primeng/inputtext";
import {ButtonDirective} from "primeng/button";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    InputTextModule,
    ButtonDirective
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

}
