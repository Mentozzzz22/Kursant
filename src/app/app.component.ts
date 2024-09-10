import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {CardModule} from "primeng/card";
import {Button} from "primeng/button";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CardModule, Button, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Kursant';
}
