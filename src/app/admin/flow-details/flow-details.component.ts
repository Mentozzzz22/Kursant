import {Component, inject, OnInit} from '@angular/core';
import {DropdownModule} from "primeng/dropdown";
import {ModuleService} from "../../service/module.service";
import {FlowService} from "../../service/flow.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Curator, flowCourses, GetFlow} from "../../../assets/models/getFlow.interface";
import {NgForOf} from "@angular/common";
import {CuratorService} from "../../service/curator.service";
import {DialogModule} from "primeng/dialog";
import {PaginatorModule} from "primeng/paginator";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-flow-details',
  standalone: true,
  imports: [
    DropdownModule,
    NgForOf,
    DialogModule,
    PaginatorModule,
    ReactiveFormsModule
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
  private messageService = inject(MessageService);


  public flow!: GetFlow;
  public curators: Curator[] = [];
  public courses: flowCourses[] = [];
  public flowId!: number;
  public flowForm!: FormGroup;
  public AddCuratorVisible: boolean = false;
  public addCuratorForm!: FormGroup;
  public selectedCourseId!: number;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.flowId = +params.get('flowId')!;
      this.loadFlow(this.flowId)
    });
    this.loadCurators()
    this.initAddCuratorForm();
  }

  private initAddCuratorForm() {
    this.addCuratorForm = this.fb.group({
      curator_id: ['', Validators.required],
      flow_course_id: [this.selectedCourseId, Validators.required]
    });
  }

  public showAddDialog(courseId: number) {
    this.selectedCourseId = courseId;
    this.initAddCuratorForm();
    this.AddCuratorVisible = true;
  }

  private loadCurators(): void {
    this.curatorService.getCurators().subscribe({
      next: (data) => {
        this.curators = data
        // this.curators = data.map((curator: Curator) =>
        //   ({label: curator.fullname, value: curator.id}));
        // console.log(this.curators)
      },
      error: (err) => console.error('Error loading curators:', err)
    });

  }

  public loadFlow(flowId: number) {
    this.flowService.getFlow(flowId).subscribe(data => {
      this.flow = data;
      this.courses = data.courses
    });
  }

  public addCurator() {
    console.log("Form Value:", this.addCuratorForm.value);
    if (this.addCuratorForm.valid) {
      const payload = this.addCuratorForm.value;
      console.log("Sending payload:", payload);
      this.flowService.addCuratorToCourse(payload).subscribe(response => {
        console.log("Response from server:", response);
        this.messageService.add({severity: 'success', summary: 'Успех', detail: 'Куратор добавлен'});
        this.AddCuratorVisible = false;
        this.loadFlow(this.flowId);
      }, error => {
        console.error("Error from server:", error);
      });
    }
  }

  public removeCurator(curatorId: number) {
    console.log(curatorId)
    this.flowService.removeCuratorFromCourse(curatorId).subscribe({
      next: (response) => {
        this.messageService.add({severity: 'success', summary: 'Успех', detail: 'Куратор удален'});
        this.loadFlow(this.flowId); // Перезагрузить данные потока
      },
      error: (error) => {
        this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить куратора'});
      }
    });
  }

}
