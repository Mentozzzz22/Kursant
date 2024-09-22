import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {LearnerHomeworkService} from "../../service/learner-homework.service";
import {HomeworkDetails, LearnerHomeworkDetails} from "../../../assets/models/learnerHomework.ineteface";
import {LearnerLessons} from "../../../assets/models/learner_course.interface";
import {ProgressBarModule} from "primeng/progressbar";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-learner-homework',
  standalone: true,
  imports: [
    ProgressBarModule,
    NgIf
  ],
  templateUrl: './learner-homework.component.html',
  styleUrl: './learner-homework.component.css'
})
export class LearnerHomeworkComponent implements OnInit{
  private learnerHomeworkService = inject(LearnerHomeworkService);
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private messageService = inject(MessageService);
  public homeworkData!: LearnerHomeworkDetails;
  public homework!: HomeworkDetails;
  public progress: number = 0;
  public courseName!: string;
  public topicName!: string;
  public teacherName!: string;
  public lessons: LearnerLessons[] = [];
  public homeworkFile: File | null = null;
  public homeworkFileName: string | undefined;

  public homeworkId!: number;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.homeworkId = +params.get('homeworkId')!;
      this.loadHomework(this.homeworkId);
    });
  }

  public loadHomework(homeworkId: number) {
    this.learnerHomeworkService.getLearnerHomework(homeworkId).subscribe({
      next: (data: LearnerHomeworkDetails) => {
        this.homeworkData = data;
        this.lessons = data.lessons;
        this.courseName = data.course_name;
        this.topicName = data.topic_name;
        this.teacherName = data.teacher_fullname
        this.homework = data.homework
      }
    });
  }

  getTemaStatusIcon(status: string): string {
    if (status === 'passed') {
      return 'assets/images/finished.svg';
    } else if (status === 'passed-retake') {
      return 'assets/images/passed-retake.svg';
    } else if (status === 'opened') {
      return 'assets/images/opened.svg';
    } else if (status === 'expired') {
      return 'assets/images/expired.svg';
    } else if (status === 'opened_retake') {
      return 'assets/images/opened-retake.svg';
    } else {
      return 'assets/images/closed.svg';
    }
  }

  public back() {
    this.router.navigate([`/student/courses/${this.homeworkData.course_id}`]);
  }

  public onHomeworkFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.homeworkFile = element.files[0];
      this.homeworkFileName = this.homeworkFile.name;
      console.log('Homework file set:', this.homeworkFileName);
    }
  }

  public triggerHomeworkFileInput(): void {
    const fileInput = document.getElementById('homeworkFile') as HTMLInputElement;
    fileInput.click();
  }

  public submitHomework(): void {
    if (this.homeworkFile) {
      this.learnerHomeworkService.saveLearnerHomework(this.homework.id, this.homeworkFile).subscribe({
        next: () => {
          this.messageService.add({severity: 'success', summary: 'Homework Submitted', detail: 'Your homework has been submitted successfully'});
        },
        error: (error) => {
          this.messageService.add({severity: 'error', summary: 'Submission Error', detail: 'Failed to submit homework'});
          console.error('Error submitting homework:', error);
        }
      });
    }
  }

  public downloadHomeworkFile(): void {
    if (this.homework && this.homework.file) {
      // Directly append the path to the base URL
      const fullUrl = `http://127.0.0.1:8000/${this.homework.file}`;
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = this.homework.file.split('/').pop() || 'download'; // Extracts the filename or defaults to 'download'
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'No File',
        detail: 'No homework file available to download'
      });
    }
  }
}
