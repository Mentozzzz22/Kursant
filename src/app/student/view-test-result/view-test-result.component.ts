import {Component, inject, OnInit} from '@angular/core';
import {LearnerTestService} from "../../service/learner-test.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {LearnerQuestions} from "../../../assets/models/getLearnerQuestions.interface";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

@Component({
  selector: 'app-view-test-result',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './view-test-result.component.html',
  styleUrl: './view-test-result.component.css'
})
export class ViewTestResultComponent implements OnInit {

  private learnerTestService = inject(LearnerTestService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private messageService = inject(MessageService);

  public currentQuestionIndex: number = 0;
  public testId!: number;
  public courseId!: number;
  public courseName!: string;
  public topicName!: string;
  public teacherName!: string;
  public correctAnswersCount!: number;
  public questions: LearnerQuestions[] = [];


  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.testId = +params.get('testId')!;
      this.getQuestions(this.testId)
    });
  }

  public getQuestions(testId: number) {
    this.learnerTestService.getTestQuestions(testId).subscribe(data => {
      this.questions = data.questions;
      this.courseId = data.course_id
      this.courseName = data.course_name;
      this.topicName = data.topic_name;
      this.teacherName = data.teacher_fullname
      this.correctAnswersCount = data.correct_answers_count
      console.log(this.questions)
    });
  }

  selectQuestion(index: number) {
    this.currentQuestionIndex = index;
  }

  public back() {
    this.router.navigate([`/student/courses/${this.courseId}`]);
  }
}
