import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import { TestantService } from '../../service/testant.service';
import {FlowService} from "../../service/flow.service";
import {MessageService, PrimeTemplate} from "primeng/api";
import {TableModule} from "primeng/table";
import {Button} from "primeng/button";
import {ConfirmPopupModule} from "primeng/confirmpopup";
import {DialogModule} from "primeng/dialog";
import {CuratorService} from "../../service/curator.service";

@Component({
  selector: 'app-testant-admin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    PrimeTemplate,
    TableModule,
    NgIf,
    NgClass,
    Button,
    ConfirmPopupModule,
    DialogModule
  ],
  templateUrl: './testant-admin.component.html',
  styleUrl: './testant-admin.component.css'
})
export class TestantAdminComponent implements OnInit{
  private testantService = inject(TestantService);
  private flowService = inject(FlowService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private curatorService = inject(CuratorService);


  selectedModal:string='';
  searchText: string = '';
  flowId:number|null=null;
  flows:any[]=[];
  testants:any[]=[];
  curators:any[]=[];
  visible: boolean = false;
  selectedDate: string = '';
  selectedTime: string = '';
  selectedDeadlineDate: string = '';
  selectedDeadlineTime: string = '';
  selectedTestId:number|null=null;



  ngOnInit(): void {
      this.loadFlows()
    }



  loadFlows() {
    this.flowService.getMeetFlows().subscribe(data => {
      this.flows = data
      // if(this.selectedModal=='update'){
      //   if (this.flowId) {
      //     this.loadCourse(this.flowId);
      //   }
      // }
    })
  }

  selectFlow(flowId: number) {
    this.flowId = flowId;
    this.loadTestants(this.flowId);
  }


  loadTestants(flowId:number|null): void {
    if (flowId !== null) {
      this.testantService.getTestants(flowId, this.searchText).subscribe(data => {
        this.testants = data.testants;
      });
    } else {
      this.messageService.add({severity: 'warn', summary: 'Внимание', detail: 'Выберите поток'});
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

  public submitForm = this.fb.group({
    start_time: [''],
    deadline: [''],
    curator_id: [''],
    flow_id: ['']}
  );

  public updateForm = this.fb.group({
    id: [''],
    start_time: [''],
    deadline: [''],
    curator_id: [''],
    flow_id: [''],
    date: [''],
    time: [''],
    deadline_date: [''],
    deadline_time: ['']
  });

  openModal(selectedModal: string, testid?: number | null) {
    this.visible = true;
    this.loadCurators();
    this.selectedModal = selectedModal;

    if (selectedModal === 'update' && testid) {
      this.selectedTestId = testid;
      const selectedMeet = this.testants.find(meet => meet.id === testid);

      if (selectedMeet) {
        const [startDatePart, startTimePart] = selectedMeet.start_time.split(' ');
        const [deadlineDatePart, deadlineTimePart] = selectedMeet.deadline ? selectedMeet.deadline.split(' ') : [null, null];

        this.updateForm.patchValue({
          id: selectedMeet.id,
          curator_id: selectedMeet.curator_id,
          flow_id: String(this.flowId),  // Используем сохраненный flowId
          date: this.formatDateForInput(startDatePart),
          time: startTimePart,
          deadline_date: deadlineDatePart ? this.formatDateForInput(deadlineDatePart) : '',
          deadline_time: deadlineTimePart || ''
        });
      }
    }  else {
      this.selectedTestId = null;
      this.submitForm.reset();
      this.updateForm.reset();
    }
  }

  formatDateForInput(dateString: string): string {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
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

      this.submitForm.patchValue({
        start_time: startTime
      });
    }
  }

  onDeadlineDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.selectedDeadlineDate = this.formatDate(inputElement.value);
    this.updateDeadline();
  }

  onDeadlineTimeChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.selectedDeadlineTime = inputElement.value;
    this.updateDeadline();
  }

  updateDeadline() {
    if (this.selectedDeadlineDate && this.selectedDeadlineTime) {
      const deadline = `${this.selectedDeadlineDate} ${this.selectedDeadlineTime}`;

      this.submitForm.patchValue({
        deadline: deadline
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


  onSubmit() {
    if (this.selectedModal === 'create' && this.submitForm.valid) {
      const requestData = this.submitForm.value;

      this.testantService.saveTestant(requestData).subscribe(
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

      if (requestData.deadline_date && requestData.deadline_time) {
        requestData.deadline = `${this.formatDate(requestData.deadline_date)} ${requestData.deadline_time}`;
      } else {
        requestData.deadline = null;
      }

      delete requestData.date;
      delete requestData.time;
      delete requestData.deadline_date;
      delete requestData.deadline_time;

      this.testantService.saveTestant(requestData).subscribe(
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
    if (this.selectedTestId) {
      this.testantService.deleteTestant(this.selectedTestId).subscribe(response => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Тест удален' });
            this.visible=false;
            confirmPopupRef.hide();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить тест' });
        }
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Произошла ошибка при теста' });
      });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Внимание', detail: 'Выберите тест для удаления' });
    }
  }

  reject(confirmPopupRef: any) {
    confirmPopupRef.hide();
  }


  closeModal(): void {
    this.visible = false;
    // this.submitForm.reset();
  }

}
