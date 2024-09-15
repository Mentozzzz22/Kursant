import {Component, inject, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {NgIf} from "@angular/common";
import {PrimeTemplate} from "primeng/api";
import {RouterLinkActive} from "@angular/router";
import {TableModule} from "primeng/table";
import {CuratorService} from "../../service/curator.service";

@Component({
  selector: 'app-students',
  standalone: true,
    imports: [
        DialogModule,
        NgIf,
        PrimeTemplate,
        RouterLinkActive,
        TableModule
    ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit{
  progress: any[] = [];
  private curatorService = inject(CuratorService);
  ngOnInit(): void {
    this.curatorService.getProgress().subscribe(data => {
      this.progress = data;
    });
  }

}
