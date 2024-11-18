import {Component, inject, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {NgForOf, NgIf} from "@angular/common";
import {PrimeTemplate} from "primeng/api";
import {RouterLinkActive} from "@angular/router";
import {TableModule} from "primeng/table";
import {CuratorService} from "../../service/curator.service";
import {CuratorFlowsInterface} from "../../../assets/models/curatorFlows.interface";
import {LearnersLessonProgress} from "../../../assets/models/LearnersLessonProgress.interface";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    DialogModule,
    NgIf,
    PrimeTemplate,
    RouterLinkActive,
    TableModule,
    NgForOf,
    FormsModule
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  private curatorService = inject(CuratorService);

  public curatorFlows: CuratorFlowsInterface[] = []
  public learnerLessonProgress: LearnersLessonProgress[] = []
  public activeFlowId: number | null = null;
  public fullname!: string;
  public accepted_at!: string;
  public lessons_passed!: number;
  public total_lesson!: number;
  searchText: string = '';

  ngOnInit(): void {
    this.getCuratorFlows()
  }

  public getCuratorFlows() {
    this.curatorService.getCuratorFlows().subscribe(data => {
      this.curatorFlows = data;
      if (this.curatorFlows.length > 0) {
        // Выбираем первый поток по умолчанию
        const firstFlowId = this.curatorFlows[0].id;
        this.getLearnersLessonProgress(firstFlowId,this.searchText);
      }
    })
  }

  public getLearnersLessonProgress(flow_id: number,search:string) {
    this.activeFlowId = flow_id;
    this.curatorService.getLearnersLessonProgress(flow_id,search).subscribe(data => {
      this.learnerLessonProgress = data
      data.map((data) => {
        this.fullname = data.fullname;
        this.accepted_at = data.accepted_at
        this.lessons_passed = data.lessons_passed
        this.total_lesson = data.total_lessons
      })

    })
  }

  searchApplications() {
    if(this.activeFlowId != null){
      this.getLearnersLessonProgress(this.activeFlowId, this.searchText);
    }
  }

}
