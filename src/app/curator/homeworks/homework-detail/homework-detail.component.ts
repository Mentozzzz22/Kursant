import {Component, inject, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {MessageService, PrimeTemplate} from "primeng/api";
import {ActivatedRoute, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {TableModule} from "primeng/table";
import {CuratorService} from "../../../service/curator.service";
import {LearnerHomeworkService} from "../../../service/learner-homework.service";
import {HomeworkDetails} from "../../../../assets/models/curatorHomeWorkDetails.interfact";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {LearnerHomework} from "../../../../assets/models/curatorLearnerHomeWork.interface";
import {FormsModule} from "@angular/forms";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-homework-detail',
  standalone: true,
  imports: [
    DialogModule,
    PrimeTemplate,
    RouterLink,
    RouterLinkActive,
    TableModule,
    NgIf,
    NgClass,
    DatePipe,
    FormsModule
  ],
  templateUrl: './homework-detail.component.html',
  styleUrl: './homework-detail.component.css'
})
export class HomeworkDetailComponent implements OnInit{

  homeWorkDetails: HomeworkDetails | null = null;
  learnerHomeWorks:LearnerHomework[]=[];
  visible: boolean = false;
  visibleRetake: boolean = false;
  homeworkId: number | null = null;
  activeStatus: string = '';
  retakeText: string | null = null;
  sendLearnerId:number|null=null;
  mark:number|null = null;

  private http = inject(HttpClient);
  private curatorService = inject(CuratorService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private learnerHomeWorkService = inject(LearnerHomeworkService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id !== null) {
        this.homeworkId = +id;
        this.loadHomeworkDetails(this.homeworkId);
        this.loadLearnerHomeWork(this.activeStatus, this.homeworkId);
      } else {
        console.error('ID is null');
      }
    });
  }

  sanitizeHtmlContent(htmlContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }


  loadHomeworkDetails(id:number){
    this.learnerHomeWorkService.getFlowHomeWorkDetails(id).subscribe(data=>{
      this.homeWorkDetails = data;
    })
  }

  filterApplications(status: string) {
    this.activeStatus = status;
    if(this.homeworkId!=null){
      this.loadLearnerHomeWork(status,this.homeworkId);
    }
  }

  loadLearnerHomeWork(status:string, id:number){
    this.learnerHomeWorkService.getLearnerHomeWorkDetails(status,id).subscribe(data=>{
      this.learnerHomeWorks = data;
    })
  }

  giveMark(learnerHomeworkId: number): void {
    this.visible = true;
    this.sendLearnerId = learnerHomeworkId;
  }

  downloadFile(url: string) {
    this.http.get(url, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const downloadURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = this.getFileName(url);
      link.click();

      this.messageService.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Файл успешно скачан'
      });
    }, (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Ошибка при скачивании файла'
      });
    });
  }


  getFileName(filePath: string): string {
    return filePath ? filePath.split('/').pop() || 'downloaded_file' : 'downloaded_file';
  }

  sendToRetake(){
    if(this.sendLearnerId!=null && this.retakeText !== null){
      this.learnerHomeWorkService.retakeHomeWork(this.sendLearnerId,this.retakeText).subscribe(
        response => {
          if (response.success) {
            this.visibleRetake = false;
            if(this.homeworkId!=null){
              this.loadLearnerHomeWork(this.activeStatus, this.homeworkId);
              this.retakeText = '';
              this.mark = null;

            }
            this.messageService.add({
              severity: 'success',
              summary: 'Успешно',
              detail: 'Ученик отправлен на ретейк'
            });
          }
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось отправить на ретейк'
          });
        }
      );

      }
  }

  sendMark(){
    if(this.sendLearnerId!=null && this.mark != null){
      this.learnerHomeWorkService.giveMarkHomeWork(this.sendLearnerId,this.mark).subscribe(
        response => {
          if (response.success) {
            this.visible= false;
            if(this.homeworkId!=null){
              this.loadLearnerHomeWork(this.activeStatus, this.homeworkId);
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Успешно',
              detail: 'Ученику поставлена оценка'
            });
          }
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось поставить оценку'
          });
        }
      );

    }
  }

  get isVisible(): boolean {
    return this.visible || this.visibleRetake;
  }

  set isVisible(value: boolean) {
    if (!value) {
      this.visible = false;
      this.visibleRetake = false;
    } else {
      if (this.visible) {
        this.visible = true;
      } else if (this.visibleRetake) {
        this.visibleRetake = true;
      }
    }
  }

  openRetakeDialog(): void {
    this.visible = false;
    this.visibleRetake = true;
  }

  closeDialog(): void {
    this.visible = false;
    this.visibleRetake = false;
    this.retakeText = '';
    this.mark = null;
    this.messageService.add({severity:'info', summary:'Отмена', detail:'Никаких изменений'});
  }

  closeModal(): void {
    this.visible = false;
    this.visibleRetake = false;
    this.retakeText = '';
    this.mark = null;
  }


  goBack() {
    window.history.back();
  }

}
