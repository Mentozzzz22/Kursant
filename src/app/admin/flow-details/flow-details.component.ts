import {Component, inject, OnInit} from '@angular/core';
import {DropdownModule} from "primeng/dropdown";
import {ModuleService} from "../../service/module.service";
import {FlowService} from "../../service/flow.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {curator, flowCourses, GetFlow} from "../../../assets/models/getFlow.interface";
import {NgForOf} from "@angular/common";
import {CuratorService} from "../../service/curator.service";

@Component({
  selector: 'app-flow-details',
  standalone: true,
  imports: [
    DropdownModule,
    NgForOf
  ],
  templateUrl: './flow-details.component.html',
  styleUrl: './flow-details.component.css'
})
export class FlowDetailsComponent implements OnInit {
  private flowService = inject(FlowService);
  private curatorService = inject(CuratorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  public flow!: GetFlow;
  public curators: curator[] = [];
  public courses: flowCourses[] = [];
  public flowId!: number;
  public flowForm!: FormGroup;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.flowId = +params.get('flowId')!;
      this.loadFlow(this.flowId)
    });

    this.loadCurators()
  }

  public loadCurators() {
    this.curatorService.getCurators().subscribe(curators => {
      this.curators = curators;
    })
  }

  public loadFlow(flowId: number) {
    this.flowService.getFlow(flowId).subscribe(data => {
      this.flow = data;
      this.courses = data.courses
      this.curators = data.courses.flatMap(course => course.curators); // собираем всех кураторов в один массив
    });
  }
}
