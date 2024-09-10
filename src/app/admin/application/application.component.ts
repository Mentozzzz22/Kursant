import {Component, inject, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {ApplicationService} from "../../service/application.service";
import {TableModule} from "primeng/table";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    TableModule,
    NgClass
  ],
  templateUrl: './application.component.html',
  styleUrl: './application.component.css'
})
export class ApplicationComponent implements OnInit {
  applications: any[] = [];
  private applicationService = inject(ApplicationService);
  ngOnInit(): void {
    this.applicationService.getApplications().subscribe(data => {
      this.applications = data;
    });
  }

}
