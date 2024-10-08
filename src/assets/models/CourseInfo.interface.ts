export interface AdditionalCourse {
  id: number;
  name: string;
  poster: string;
  big_poster: string;
  teacher_fullname: string;
  price: number;
  current_price: number;
  discount_percentage: number;
  description: string;
  modules_count: number;
  lessons_count: number;
  free_lesson_id: number;
  flow_date: string;
}

export interface InfoHomework {
  id: number;
  status: string;
}

export interface InfoTest {
  id: number;
  status: string;
}

export interface InfoLessons {
  id: number;
  status: string;
  name: string;
  isAvailable?: boolean;
}

export interface InfoTopics {
  name: string;
  status: string;
  lessons: InfoLessons[];
  test: InfoTest;
  homework: InfoHomework;
}

export interface InfoModules {
  module_name: string;
  topics: string[];
}

export interface CourseInfo {
  course_id: number;
  name: string;
  poster: string;
  big_poster: string;
  teacher_fullname: string;
  price: number;
  current_price: number;
  discount_percentage: number;
  description: string;
  modules_count: number;
  lessons_count: number;
  free_lesson_id: number;
  additional_courses: AdditionalCourse[];
  modules: InfoModules[];
}
