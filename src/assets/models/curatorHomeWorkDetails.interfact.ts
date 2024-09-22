export interface HomeworkDetails {
  flow_homework_id: number;
  topic_name: string;
  topic_index: number;
  description: string;
  deadline: string;
  sent_count:number;
  not_passed_count:number;
  total_count:number,
  file: string;
}
