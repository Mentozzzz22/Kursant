export interface LearnerHomework {
  learner_homework_id: number;
  learner_fullname: string;
  passed_at: string | null;
  uploaded_file: string | null;
  status: string;
  is_expired: boolean;
  mark: number | null;
  retake_comment: string | null;
}
