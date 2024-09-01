import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CardModule} from "primeng/card";
import {Button} from "primeng/button";
import {NavbarComponent} from "./navbar/navbar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CardModule, Button, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Kursant';
}
