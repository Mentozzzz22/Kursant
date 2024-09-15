import {Component, inject, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {MessageService, PrimeTemplate} from "primeng/api";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {TableModule} from "primeng/table";
import {CuratorService} from "../../../service/curator.service";

@Component({
  selector: 'app-homework-detail',
  standalone: true,
    imports: [
        DialogModule,
        PrimeTemplate,
        RouterLink,
        RouterLinkActive,
        TableModule
    ],
  templateUrl: './homework-detail.component.html',
  styleUrl: './homework-detail.component.css'
})
export class HomeworkDetailComponent implements OnInit{
  progress: any[] = [];
  visible: boolean = false;
  visibleRetake: boolean = false;
  private curatorService = inject(CuratorService);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.curatorService.getProgress().subscribe(data => {
      this.progress = data;
    });
  }

  showDialog() {
    this.visible = true;
  }

  showRetakeDialog() {
    this.visibleRetake = true;
  }
}
