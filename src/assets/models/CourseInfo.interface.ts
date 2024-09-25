export interface AdditionalCourse {
  id: number;
  name: string;
  poster: string;
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
  topics: string[];  // Обновлено для строковых тем
}

export interface CourseInfo {
  course_id: number; // ID курса
  name: string;
  poster: string;
  big_poster: string;
  teacher_fullname: string;
  price: number;
  current_price: number; // Цена с учетом скидки
  discount_percentage: number; // Процент скидки
  description: string; // Описание курса
  modules_count: number;
  lessons_count: number;
  free_lesson_id: number; // ID бесплатного урока
  additional_courses: AdditionalCourse[]; // Дополнительные курсы
  modules: InfoModules[];
}
