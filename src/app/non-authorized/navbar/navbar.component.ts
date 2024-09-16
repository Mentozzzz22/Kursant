import {Component, inject, OnInit} from '@angular/core';
import {InputTextModule} from "primeng/inputtext";
import {ButtonDirective} from "primeng/button";
import {BadgeModule} from "primeng/badge";
import {OrderService} from "../../service/order.service";
import {RouterLink} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {CourseService} from "../../service/course.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    InputTextModule,
    ButtonDirective,
    BadgeModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  cartCount: number = 0;
  private orderService = inject(OrderService);
  private courseService = inject(CourseService);
  public searchText: string = '';
  ngOnInit() {
    this.orderService.getCartCount().subscribe((count) => {
      this.cartCount = count;
    });
  }

  onSearchChange() {
    this.courseService.setSearchText(this.searchText);
  }

}
