import { Component } from '@angular/core';
import {CardModule} from "primeng/card";
import {Button} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CardModule,
    Button,
    InputTextModule
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {

}
