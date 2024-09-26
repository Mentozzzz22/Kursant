import {SafeHtml} from "@angular/platform-browser";

export interface Options {
  answerId: number;
  answerName: string;
  is_selected: boolean;
  is_correct: boolean;
}

export interface LearnerQuestions {
  id: number;
  question: string;
  is_correct: boolean;
  options: Options[]
  safeHtmlContent?: SafeHtml;
}

export interface GetLearnerQuestions {
  course_id: number;
  course_name: string;
  module_name: string;
  topic_name: string;
  teacher_fullname: string;
  status: string;
  ends_at: string;
  correct_answers_count: number;
  homework_id: number;
  questions: LearnerQuestions[]

}
