import {LearnerHomework, LearnerLessons} from "./learner_course.interface";

export interface Testing {
  id: number;
  status: string;
  questions_count: number;
  duration: number;
  deadline: string;
  taken_marks: number;
  passed_at: string;
}

export interface getLearnerTest {
  course_id: number;
  course_name: string;
  module_name: string;
  topic_name: string;
  teacher_fullname: string;
  lessons: LearnerLessons[]
  test: Testing;
  homework: LearnerHomework;
}
