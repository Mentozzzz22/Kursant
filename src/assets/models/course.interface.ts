export interface Course {
  id?: number;
  name: string;
  description: string;
  poster: string;
  modules_count: number;
  lessons_count: number;
  current_price: number;
  price: number;
  discount_percentage: number;
  flow_date: string;
  teacher_fullname: string;
}
