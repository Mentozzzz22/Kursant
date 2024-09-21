import {Component, inject, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {MessageService, PrimeTemplate} from "primeng/api";
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {TableModule} from "primeng/table";
import {ApplicationService} from "../../service/application.service";
import {FormBuilder, FormsModule} from "@angular/forms";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {CuratorService} from "../../service/curator.service";
import {LearnerHomeworkService} from "../../service/learner-homework.service";
import {CuratorHomeWorks} from "../../../assets/models/curatorHomeWorks.interface";
import {ProgressBarModule} from "primeng/progressbar";
import {FlowTest} from "../../../assets/models/curatorTestWork.interface";
import {LearnerTestService} from "../../service/learner-test.service";

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
    NgIf,
    NgForOf,
    ProgressBarModule,
    RouterOutlet,
    FormsModule,
    DatePipe
  ],
  templateUrl: './homeworks.component.html',
  styleUrl: './homeworks.component.css'
})
export class HomeworksComponent implements OnInit {

  private curatorService = inject(CuratorService);
  private messageService = inject(MessageService);
  private learnerHomeWorkService = inject(LearnerHomeworkService);
  private learnerTestService = inject(LearnerTestService);
  private router = inject(Router)

  searchText: string = '';
  activeFlowId: number | null = null;
  flow:any[]=[];
  flowId:number|null=null;
  homeWorks:CuratorHomeWorks[]=[];
  testWorks:FlowTest[]=[];
  visible: boolean = false;
  activeTab: string = 'homeWorks';
  ngOnInit(): void {
    this.loadCuratorFlow();
  }


  showDialog() {
    this.visible = true;
  }

  loadCuratorFlow() {
    this.curatorService.getCuratorFlow().subscribe(data => {
      this.flow = data;
      if (this.flow && this.flow.length > 0) {
        this.flowId = this.flow[0].id;

        // Load the corresponding data based on the active tab
        if (this.flowId != null) {
          this.loadDataBasedOnTab();
        }
      }
    });
  }

  loadDataBasedOnTab() {
    if (this.activeTab === 'homeWorks') {
      if(this.flowId){
        this.loadCuratorHomeWork(this.flowId, this.searchText);
      }
    } else if (this.activeTab === 'testWorks') {
      if(this.flowId){
        this.loadTestHomeWork(this.flowId, this.searchText);
      }
    }
  }

  loadCuratorHomeWork(id: number,search:string): void {
    if (id !== null && id !== undefined) {
      this.activeFlowId = id;
      this.learnerHomeWorkService.getFlowHomeWorks(id,search).subscribe(data => {
        this.homeWorks = data;
      });
    } else {
      console.error('flowId is not valid');
    }
  }

  loadTestHomeWork(id: number,search:string): void {
    if (id !== null && id !== undefined) {
      this.activeFlowId = id;
      this.learnerTestService.getFlowTestWorks(id,search).subscribe(data => {
        this.testWorks = data;
      });
    } else {
      console.error('flowId is not valid');
    }
  }

  searchApplications() {
    if(this.flowId != null){
      this.loadCuratorHomeWork(this.flowId, this.searchText);
    }
  }

  calculateProgress(numberFirst: number, numberSecond: number): number {
    if (numberSecond === 0) {
      return 0;
    }
    return (numberFirst / numberSecond) * 100;
  }

  openDetails(id: number) {
    this.router.navigate(['/curator/homework-detail', id]);
  }

  openTestDetails(id: number) {
    this.router.navigate(['/curator/test-detail', id]);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.loadDataBasedOnTab();
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
