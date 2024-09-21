export interface FlowTest {
  flow_test_id: number;
  module_name: string;
  module_index: number;
  topic_name: string;
  topic_index: number;
  deadline: string;
  passed_count: number;
  total_count: number;
}
