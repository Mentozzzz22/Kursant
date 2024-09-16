import {Component, inject, OnInit} from '@angular/core';
import {NgForOf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-edit-tema',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './edit-tema.component.html',
  styleUrl: './edit-tema.component.css'
})
export class EditTemaComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private courseId!: number;
  private moduleId!: number;
  public selectedFileName: string | undefined;
  public selectedFile: File | null = null;

  lessons = [
    {id: 1, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 2, name: 'Казақстандағы ежелгі адамдардың өмірі'},
  ];

  ngOnInit() {
  }

  public back() {
    this.router.navigate([`/admin/edit-course/${this.courseId}`]);
  }

  public triggerFileInput(): void {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    fileInput.click();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }
}
