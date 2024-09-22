export interface LearnerCourses {
  id: number;
  lessons_count: number;
  modules_count: number;
  name: string;
  poster: string;
  progress: number;
}

export interface OtherCourses {
  id: number;
  lessons_count: number;
  modules_count: number;
  name: string;
  poster: string;
  current_price: number;
  price: number;
  discount_percentage: number;
  close_flow: string;
}
