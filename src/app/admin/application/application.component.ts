import {Component, inject, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {ApplicationService} from "../../service/application.service";
import {TableModule} from "primeng/table";
import {NgClass} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {MessageService} from "primeng/api";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    TableModule,
    NgClass,
    DialogModule,
    Button,
    InputTextModule
  ],
  templateUrl: './application.component.html',
  styleUrl: './application.component.css'
})
export class ApplicationComponent implements OnInit {
  applications: any[] = [];
  visible: boolean = false;
  private applicationService = inject(ApplicationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  ngOnInit(): void {
    this.applicationService.getApplications().subscribe(data => {
      this.applications = data;
    });
  }

  public appForm = this.fb.group({

  })

  showDialog() {
    this.visible = true;
  }

  closeDialog() {
    this.visible = false;
    this.messageService.add({severity:'info', summary:'Отмена', detail:'Никаких изменений'});
  }

  cancelDialog(){
    this.visible = false;
    this.messageService.add({severity:'custom', summary:'Отклонить', detail:'Заявка отклонена',icon: 'pi-file-excel'});
  }

  saveDialog(){
    this.visible = false;
    this.messageService.add({severity:'success', summary:'Открыть доступ', detail:'Доступ открыт',icon: 'pi-lock-open'});
  }

}
