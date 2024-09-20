export interface curator {
  curator_id: number;
  fullname: string;
}

export interface flowCourses {
  course_id: number;
  name: string;
  curators: curator[];
}

export interface GetFlow {
  flow_id: number;
  starts_at: string;
  name: string;
  courses: flowCourses[]
}
