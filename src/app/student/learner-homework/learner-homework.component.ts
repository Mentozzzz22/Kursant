import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {LearnerHomeworkService} from "../../service/learner-homework.service";
import {HomeworkDetails, LearnerHomeworkDetails} from "../../../assets/models/learnerHomework.ineteface";
import {LearnerLessons} from "../../../assets/models/learner_course.interface";
import {ProgressBarModule} from "primeng/progressbar";

@Component({
  selector: 'app-learner-homework',
  standalone: true,
  imports: [
    ProgressBarModule
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
}
