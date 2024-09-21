export interface LearnerTest {
  learner_fullname: string;
  mark: number | null;
  passed_at: string | null;
  is_expired: boolean | null;
  learner_test_id: number | null;
}
