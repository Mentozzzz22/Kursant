import {Component, inject, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {MessageService, PrimeTemplate} from "primeng/api";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {TableModule} from "primeng/table";
import {ApplicationService} from "../../service/application.service";
import {FormBuilder} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {CuratorService} from "../../service/curator.service";

@Component({
  selector: 'app-homeworks',
  standalone: true,
  imports: [
    DialogModule,
    PrimeTemplate,
    RouterLink,
    RouterLinkActive,
    TableModule,
    NgClass,
    NgIf
  ],
  templateUrl: './homeworks.component.html',
  styleUrl: './homeworks.component.css'
})
export class HomeworksComponent implements OnInit {
  progress: any[] = [];
  visible: boolean = false;
  activeTab: string = 'homeWorks';
  private curatorService = inject(CuratorService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  ngOnInit(): void {
    this.curatorService.getProgress().subscribe(data => {
      this.progress = data;
    });
  }

  public appForm = this.fb.group({

  })

  showDialog() {
    this.visible = true;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
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
