export interface LearnerHomeworkDetails {
  course_id: number;
  course_name: string;
  module_name: string;
  topic_name: string;
  teacher_fullname: string;
  lessons: Lesson[];
  test: TestDetails;
  homework: HomeworkDetails;
}

export interface Lesson {
  id: number;
  status: string;
  name: string;
}

export interface TestDetails {
  id: number;
  status: string;
}

export interface HomeworkDetails {
  id: number;
  file: string; // URL of homework file from teacher
  status: string;
  description: string;
  deadline: string; // Date format like '22.09.2024 23:59'
  retake_comment: string | null;
  uploaded_file: string | null; // Learner's uploaded homework file URL
  mark: number | null; // Null if not marked yet
}
