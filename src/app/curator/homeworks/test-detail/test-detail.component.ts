import {Component, inject, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {LearnerTestService} from "../../../service/learner-test.service";
import {LearnerTest} from "../../../../assets/models/curatorLearnerTest.interface";
import {PrimeTemplate} from "primeng/api";
import {TableModule} from "primeng/table";

@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    DatePipe,
    PrimeTemplate,
    TableModule
  ],
  templateUrl: './test-detail.component.html',
  styleUrl: './test-detail.component.css'
})
export class TestDetailComponent implements OnInit{
  private route = inject(ActivatedRoute);
  private learnerTestService = inject(LearnerTestService);


  testId: number | null = null;
  test:any| null = null;
  testWorks:LearnerTest[]=[];
  activeStatus: string = '';
  ngOnInit(): void {
    this.loadTestTopics()

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id !== null) {
        this.testId = +id;
        this.loadTestTopics();
       this.loadTestHomeWork(this.activeStatus, this.testId);
      } else {
        console.error('ID is null');
      }
    });
  }

  loadTestTopics(){
    if(this.testId){
      this.learnerTestService.getTestName(this.testId).subscribe(data=>{
        this.test=data;
      })
    }
  }

  loadTestHomeWork(status:string, id:number){
    this.learnerTestService.getLearnerTestDetails(status,id).subscribe(data=>{
      this.testWorks = data;
    })
  }

  filterApplications(status: string) {
    this.activeStatus = status;
    if(this.testId!=null){
      this.loadTestHomeWork(status,this.testId);
    }
  }

  goBack() {
    window.history.back();
  }

}
