export interface Curator {
  curator_id: number;
  id: number;
  fullname: string;
  phone_number: string;
  is_active: boolean;
}

export interface flowCourses {
  course_id: number;
  name: string;
  edit_course_id : number;
  curators: Curator[];
}

export interface GetFlow {
  flow_id: number;
  starts_at: string;
  name: string;
  index: number;
  courses: flowCourses[]
}
