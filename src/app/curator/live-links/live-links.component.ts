import {Component, inject, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Subscription} from "rxjs";
import {MeetService} from "../../service/meet.service";
import {MessageService, PrimeTemplate} from "primeng/api";
import {TableModule} from "primeng/table";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-live-links',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PrimeTemplate,
    TableModule,
    FormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './live-links.component.html',
  styleUrl: './live-links.component.css'
})
export class LiveLinksComponent implements OnInit{
  private meetService = inject(MeetService);
  private messageService = inject(MessageService);

  searchText: string = '';
  meets:any[]=[];

  ngOnInit() {
    this.loadMeets();
  }

  loadMeets(){
    this.meetService.getMeetingsForCurator(this.searchText).subscribe(data=>
    this.meets = data);
  }

  startMeeting(meet_id: number) {
    this.meetService.startMeeting(meet_id).subscribe(
      (response) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Встреча начата' });
        } else if (Array.isArray(response) && response[0] === "Meet was started") {
          this.messageService.add({ severity: 'warn', summary: 'Предупреждение', detail: 'Встреча уже была начата' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось начать встречу' });
        }
      },
      (error) => {
        if (Array.isArray(error.error) && error.error[0] === "Meet was started") {
          this.messageService.add({ severity: 'warn', summary: 'Предупреждение', detail: 'Встреча уже была начата' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: `Ошибка: ${error.status}` });
        }
      }
    );
  }

  joinMeeting(link: string) {
    window.open(link, '_blank');
  }



}
