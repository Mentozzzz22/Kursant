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
  curators: Curator[];
}

export interface GetFlow {
  flow_id: number;
  starts_at: string;
  name: string;
  courses: flowCourses[]
}
