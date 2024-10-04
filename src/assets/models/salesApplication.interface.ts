export interface SalesApplication {
  order_id: number;
  learner_fullname: string;
  learner_phone_number: string;
  learner_region: string;
  paid_check: File | string | null;
  comments: string;
  courses: {
    course_id: number;
    expires_at: string;
  }[];
  handled_by: string | null;
  status: string;
  status_display: string;
  rejection_reason: string;
  flow_id: number | null;
}
