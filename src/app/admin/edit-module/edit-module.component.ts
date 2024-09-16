import {Component, inject, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {Location, NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-edit-module',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    NgForOf,
    NgIf,
    RouterOutlet
  ],
  templateUrl: './edit-module.component.html',
  styleUrl: './edit-module.component.css'
})
export class EditModuleComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private courseId!: number;
  private moduleId!: number;
  public EditModuleVisible: boolean = false;
  public isTemaOpened: boolean = false;

  temas = [
    {id: 1, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 2, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 3, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 4, name: 'Казақстандағы ежелгі адамдардың өмірі'},
  ];

  ngOnInit() {
    this.route.parent!.paramMap.subscribe(params => {
      this.courseId = +params.get('courseId')!;
      console.log('Course ID:', this.courseId);
    });

    this.route.paramMap.subscribe(params => {
      this.moduleId = +params.get('moduleId')!;
      console.log('Module ID:', this.moduleId);
    });
  }

  public showEditDialog() {
    this.EditModuleVisible = true;
  }

  public back() {
    this.router.navigate([`/admin/edit-course/${this.courseId}`]);
  }

  public navigateToEditTema(temaId: number) {
    this.router.navigate([`/admin/edit-course/${this.courseId}/edit-module/${this.moduleId}/edit-tema/`, temaId]);
    this.isTemaOpened = true;
  }
}
