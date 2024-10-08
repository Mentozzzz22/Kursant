export interface GetCourseList {
  learner_course_id: number;
  course_name: string;
}

export interface Grades {
  module_id: number;
  module_index: number;
  marks: Marks[]
}

export interface Marks {
  id: number;
  type: string;
  topic_name: string;
  mark?: number;
  taken_marks?: number;
  total_marks?: number;
}
