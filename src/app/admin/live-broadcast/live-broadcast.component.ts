import {Component, inject, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";
import {ConfirmPopupModule} from "primeng/confirmpopup";
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {NgxMaskDirective} from "ngx-mask";
import {MessageService, PrimeTemplate} from "primeng/api";
import {TableModule} from "primeng/table";
import {CuratorService} from "../../service/curator.service";
import {FlowService} from "../../service/flow.service";
import {MeetService} from "../../service/meet.service";
import {core} from "@angular/compiler";
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
  private flowService = inject(FlowService);
  private meetService = inject(MeetService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
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


  ngOnInit(): void {
    this.loadFlows()
  }

  public submitForm = this.fb.group({
    name: [''],
    curator_id: [''],
    flow_course_id: [''],
    start_time:['']}
  );



  loadFlows() {
    this.flowService.getMeetFlows().subscribe(data => {
      this.flows = data
      // this.loadCourse(this.flowId);
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

  loadMeetings(courseId:number): void {
    console.log(this.flowId, courseId);
    if (this.flowId !== null && courseId !== null) {
      this.courseId = courseId;
      this.meetService.getMeetings(this.flowId, courseId,this.searchText).subscribe(data => {
        this.meets = data;
      });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Внимание', detail: 'Выберите поток' });
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
      this.submitForm.patchValue({
        start_time: startTime
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }


  openModal(){
    this.visible=true;
    this.loadCurators()
  }

  closeModal(): void {
    this.visible = false;
    this.submitForm.reset();
  }


  onSubmit() {
    if (this.submitForm.valid) {
      const requestData = this.submitForm.value;

      this.meetService.saveMeeting(requestData).subscribe(
        (response: any) => {
          if (response.success) {
            this.visible=false;
            this.submitForm.reset();
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Встреча сохранена' });
          }
        },
        (error) => {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Произошла ошибка при сохранении встречи' });
        }
      );
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Предупреждение', detail: 'Заполните все обязательные поля' });
    }
  }




}
