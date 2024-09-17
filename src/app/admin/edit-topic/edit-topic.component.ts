import {Component, inject, OnInit} from '@angular/core';
import {NgForOf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-edit-topic',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './edit-topic.component.html',
  styleUrl: './edit-topic.component.css'
})
export class EditTopicComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private courseId!: number;
  private moduleId!: number;
  private topicId!: number;
  public selectedFileName: string | undefined;
  public selectedFile: File | null = null;

  lessons = [
    {id: 1, name: 'Казақстандағы ежелгі адамдардың өмірі'},
    {id: 2, name: 'Казақстандағы ежелгі адамдардың өмірі'},
  ];

  ngOnInit() {
    this.route.parent!.paramMap.subscribe(params => {
      this.courseId = +params.get('courseId')!;
      this.moduleId = +params.get('moduleId')!;
    });
    this.route.paramMap.subscribe(params => {
      this.topicId = +params.get('topicId')!;
    });
    console.log(this.courseId)
    console.log(this.moduleId)
    console.log(this.topicId)
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
