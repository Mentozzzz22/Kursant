import { Component } from '@angular/core';
import {NavbarComponent} from "./navbar/navbar.component";
import {RouterModule} from "@angular/router";

@Component({
  selector: 'app-non-authorized',
  standalone: true,
  imports: [
    NavbarComponent,
    RouterModule,
  ],
  templateUrl: './non-authorized.component.html',
  styleUrl: './non-authorized.component.css'
})
export class NonAuthorizedComponent {

}
