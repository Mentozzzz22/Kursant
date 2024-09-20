export interface flowsCourses {
  name: string;
  teacher_fullname: string;
}

export interface GetFlows {
  flow_id: number;
  starts_at: string;
  name: string;
  courses: flowsCourses[]
}
