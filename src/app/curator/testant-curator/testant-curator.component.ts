import {Component, inject, OnInit} from '@angular/core';
import {TestantService} from "../../service/testant.service";
import {FlowService} from "../../service/flow.service";
import {MessageService, PrimeTemplate} from "primeng/api";
import {FormBuilder} from "@angular/forms";
import {CuratorService} from "../../service/curator.service";
import {NgForOf, NgIf} from "@angular/common";
import {TableModule} from "primeng/table";

@Component({
  selector: 'app-testant-curator',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    PrimeTemplate,
    TableModule
  ],
  templateUrl: './testant-curator.component.html',
  styleUrl: './testant-curator.component.css'
})
export class TestantCuratorComponent implements OnInit{
  private testantService = inject(TestantService);

  testants:any[]=[];



  ngOnInit(): void {
    this.loadTestants()
  }


  loadTestants(): void {
      this.testantService.getTestantForCurator().subscribe(data => {
        this.testants = data;
      });
  }

}
