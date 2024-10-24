import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {MessageService} from "primeng/api";
import {LearnerHomeworkService} from "../../service/learner-homework.service";
import {HomeworkDetails, LearnerHomeworkDetails} from "../../../assets/models/learnerHomework.ineteface";
import {LearnerLessons} from "../../../assets/models/learner_course.interface";
import {ProgressBarModule} from "primeng/progressbar";
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-learner-homework',
  standalone: true,
  imports: [
    ProgressBarModule,
    NgIf,
    NgClass,
    NgStyle,
    RouterLink,
    NgForOf
  ],
  templateUrl: './learner-homework.component.html',
  styleUrl: './learner-homework.component.css'
})
export class LearnerHomeworkComponent implements OnInit {
  private learnerHomeworkService = inject(LearnerHomeworkService);
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private messageService = inject(MessageService);
  private sanitizer = inject(DomSanitizer);
  public homeworkData!: LearnerHomeworkDetails;
  public homework!: HomeworkDetails;
  public progress: number = 0;
  public deadline!: string;
  public courseName!: string;
  public topicName!: string;
  public description!: string;
  public teacherName!: string;
  public lessons: LearnerLessons[] = [];
  public homeworkFile: File | null = null;
  public homeworkFileName!: string;
  public homeworkId!: number;
  public lessonsAndTests: any[] = [];
  progressSegments: { filled: boolean }[] = [];
  public fullUrl!: string

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
        this.description = data.homework.description;
        this.homework = data.homework
        this.deadline = this.homework.deadline
        this.homeworkFileName = data.homework.file
        this.lessonsAndTests = [...this.lessons];
        const encodedFilePath = encodeURI(this.homework.file);
        this.fullUrl = `http://127.0.0.1:8000${encodedFilePath}`;
        console.log(this.fullUrl)

        if (data.test) {
          this.lessonsAndTests.push({
            id: data.test.id,
            status: data.test.status,
            type: 'test'
          });
        }

        if (data.homework) {
          this.lessonsAndTests.push({
            id: data.homework.id,
            status: data.homework.status,
            type: 'homework'
          });
        }

        this.calculateProgress();
      }
    });
  }

  public safeHtmlContent!: SafeHtml;

  // Возвращаем SafeHtml для использования в шаблоне
  sanitizeHtmlContent(htmlContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  getTemaStatusIcon(status: string): string {
    if (status === 'passed') {
      return 'assets/images/finished.svg';
    } else if (status === 'opened') {
      return 'assets/images/opened.svg';
    } else if (status === 'expired') {
      return 'assets/images/expired.svg';
    } else if (status === 'opened_retake') {
      return 'assets/images/opened-retake.svg';
    } else if (status === 'passed_retake') {
      return 'assets/images/finished.svg';
    } else {
      return 'assets/images/closed.svg';
    }
  }

  public calculateProgress() {
    const totalItems = this.lessonsAndTests.length;

    const passedItems = this.lessonsAndTests.filter(item => item.status === 'passed').length;

    if (totalItems > 0) {
      this.progress = (passedItems / totalItems) * 100;

      this.progressSegments = [];

      for (let i = 0; i < totalItems; i++) {
        this.progressSegments.push({
          filled: this.lessonsAndTests[i].status === 'passed'
        });
      }
    }
  }

  public getRouterLink(item: any) {
    if (item.status === 'passed' || item.status === 'opened') {
      if (item.type === 'test') {
        return ['/student/test', item.id];
      } else if (item.type === 'homework') {
        return ['/student/homework', item.id];
      } else {
        return ['/student/lesson', item.id];
      }
    }
    return null;
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
          this.loadHomework(this.homeworkId)
          this.messageService.add({
            severity: 'success',
            summary: 'Сәтті',
            detail: 'Үй тапсырмасы жіберілді!'
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Қате',
            detail: 'Үй тапсырмасын жіберу мүмкін болмады'
          });
          console.error('Error submitting homework:', error);
        }
      });
    }
  }

}
