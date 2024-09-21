import {LearnerHomework, LearnerLessons, LearnerTest} from "./learner_course.interface";

export interface LearnerLesson {
  course_id: number;
  course_name: string;
  module_name: string;
  topic_name: string;
  lesson_name: string;
  lesson_number: number;
  teacher_fullname: string;
  next_lesson_id: number;
  video: string;
  lessons: LearnerLessons[];
  test: LearnerTest;
  homework: LearnerHomework;
}
