import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {Button} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";
import {ConfirmPopup, ConfirmPopupModule} from "primeng/confirmpopup";
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {NgxMaskDirective} from "ngx-mask";
import {ConfirmationService, MessageService, PrimeTemplate} from "primeng/api";
import {TableModule} from "primeng/table";
import {CuratorService} from "../../service/curator.service";
import {FlowService} from "../../service/flow.service";
import {MeetService} from "../../service/meet.service";
import {ProgressBarModule} from "primeng/progressbar";

@Component({
  selector: 'app-live-broadcast',
  standalone: true,
  imports: [
    Button,
    CheckboxModule,
    ConfirmPopupModule,
    DialogModule,
    FormsModule,
    NgForOf,
    NgIf,
    NgxMaskDirective,
    PrimeTemplate,
    ReactiveFormsModule,
    TableModule,
    ProgressBarModule
  ],
  templateUrl: './live-broadcast.component.html',
  styleUrl: './live-broadcast.component.css'
})
export class LiveBroadcastComponent implements OnInit{
  @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;
  @ViewChild('dateInput') dateInput!: ElementRef;
  @ViewChild('timeInput') timeInput!: ElementRef;


  private flowService = inject(FlowService);
  private meetService = inject(MeetService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService)
  private curatorService = inject(CuratorService);



  searchText: string = '';
  flows:any[]=[];
  meets:any[]=[];
  curators:any[]=[];
  flowId:number|null=null;
  flowIdByForm:number|null=null;
  courseId:number|null=null;
  courses:any[]=[];
  coursesByModal:any[]=[];
  visible: boolean = false;
  selectedDate: string = '';
  selectedTime: string = '';
  selectedMeetId:number|null=null;
  selectedModal:string='';


  ngOnInit(): void {
    this.loadFlows()
  }

  public submitForm = this.fb.group({
    name: [''],
    curator_id: [''],
    flow_id: [''],
    flow_course_id: [''],
    start_time:['']}
  );

  public updateForm = this.fb.group({
    id:[''],
    name: [''],
    curator_id: [''],
    flow_id: [''],
    flow_course_id: [''],
    date: [''],
    time: [''],
    start_time: ['']
  });

  loadFlows() {
    this.flowService.getMeetFlows().subscribe(data => {
      this.flows = data
      if(this.selectedModal=='update'){
        if (this.flowId) {
          this.loadCourse(this.flowId);
        }
      }
    })
  }

  selectFlow(flowId: number) {
    this.flowId = flowId;
    this.loadCourse(this.flowId);
  }

  selectFlowByModal(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.flowIdByForm = +target.value;
    this.loadCourseByModal(this.flowIdByForm);
  }

  loadCourseByModal(flowId: number | null){
    if(flowId!=null){
      this.flowService.getMeetCourse(flowId).subscribe(data=>
        this.coursesByModal=data
      )
    }
  }

  loadCourse(flowId: number | null){
    if(flowId!=null){
      this.flowService.getMeetCourse(flowId).subscribe(data=>
      this.courses=data
      )
    }
  }

  private loadCurators(): void {
    this.curatorService.getCurators().subscribe({
      next: (data) => {
        this.curators = data
      },
      error: (err) => console.error('Error loading curators:', err)
    });
  }

  searchMeet(){
    this.loadMeetings(this.courseId);
  }

  loadMeetings(courseId:number|null): void {
    if (this.flowId !== null && courseId !== null) {
      this.courseId = courseId;
      this.meetService.getMeetings(this.flowId, courseId,this.searchText).subscribe(data => {
        this.meets = data.meetings;
      });
    } else if (this.flowId == null) {
      this.messageService.add({ severity: 'warn', summary: 'Внимание', detail: 'Выберите поток' });
    }else{
      this.messageService.add({ severity: 'warn', summary: 'Внимание', detail: 'Выберите курс' });

    }
  }


  onDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.selectedDate = this.formatDate(inputElement.value);
    this.updateStartTime();
  }

  onTimeChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.selectedTime = inputElement.value;
    this.updateStartTime();
  }

  updateStartTime() {
    if (this.selectedDate && this.selectedTime) {
      const startTime = `${this.selectedDate} ${this.selectedTime}`;
      console.log("Start Time:", startTime);

      if (this.selectedModal === 'update') {
        this.updateForm.patchValue({
          start_time: startTime
        });
      } else {
        this.submitForm.patchValue({
          start_time: startTime
        });
      }
    }
  }


  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }


  openModal(selectedModal: string, meetId?: number | null) {
    this.visible = true;
    this.loadCurators();
    this.selectedModal = selectedModal;

    if (selectedModal === 'update' && meetId) {
      this.selectedMeetId = meetId;
      const selectedMeet = this.meets.find(meet => meet.id === meetId);

      if (selectedMeet) {
        const [datePart, timePart] = selectedMeet.start_time.split(' ');

        this.updateForm.patchValue({
          id: selectedMeet.id,
          name: selectedMeet.name,
          curator_id: selectedMeet.curator_id,
          flow_id: selectedMeet.flow_id,
          flow_course_id: selectedMeet.flow_course_id,
          date: this.formatDateForInput(datePart),
          time: timePart
        });

        this.loadCourseByModal(selectedMeet.flow_id);
      }
    } else {
      this.selectedMeetId = null;
      this.submitForm.reset();
      this.updateForm.reset();
      this.curators = []
      this.dateInput.nativeElement.value = '';
      this.timeInput.nativeElement.value = '';
    }
  }

  formatDateForInput(dateString: string): string {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
  }


  confirm(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      accept: () => {
        this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Куратор удален'});
      },
      reject: () => {
        this.messageService.add({severity: 'info', summary: 'Отмена', detail: 'Вы отклонили'});
      }
    });
  }

  reject(confirmPopupRef: any) {
    confirmPopupRef.hide();
  }

  closeModal(): void {
    this.visible = false;
    this.submitForm.reset();
  }




  onSubmit() {
    if (this.selectedModal === 'create' && this.submitForm.valid) {
      const requestData = this.submitForm.value;

      this.meetService.saveMeeting(requestData).subscribe(
        (response: any) => {
          if (response.success) {
            this.visible = false;
            this.submitForm.reset();
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Встреча сохранена' });
          }
        },
        (error) => {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Произошла ошибка при сохранении встречи' });
        }
      );

    }else if (this.selectedModal === 'update' && this.updateForm.valid) {
      const requestData = this.updateForm.value;

      if (requestData.date && requestData.time) {
        requestData.start_time = `${this.formatDate(requestData.date)} ${requestData.time}`;
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Ошибка', detail: 'Необходимо заполнить дату и время' });
        return;
      }

      delete requestData.date;
      delete requestData.time;

      this.meetService.saveMeeting(requestData).subscribe(
        (response: any) => {
          if (response.success) {
            this.visible = false;
            this.updateForm.reset();
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Встреча обновлена' });
          }
        },
        (error) => {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Произошла ошибка при обновлении встречи' });
        }
      );
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Предупреждение', detail: 'Заполните все обязательные поля' });
    }
  }



  deleteMeeting(confirmPopupRef: any) {
    if (this.selectedMeetId) {
      this.meetService.deleteMeeting(this.selectedMeetId).subscribe(response => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Встреча удалена' });
          if (this.courseId) {
            this.visible=false;
            confirmPopupRef.hide();
          }
        } else {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить встречу' });
        }
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Произошла ошибка при удалении' });
      });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Внимание', detail: 'Выберите встречу для удаления' });
    }
  }
}
