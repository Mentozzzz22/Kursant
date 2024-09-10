import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {ButtonDirective} from "primeng/button";
import {Ripple} from "primeng/ripple";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterOutlet,
    ButtonDirective,
    RouterLink,
    RouterLinkActive,
    Ripple
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}
