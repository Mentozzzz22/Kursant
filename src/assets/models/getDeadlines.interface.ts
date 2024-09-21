export interface FlowLessons {
  id: number;
  deadline: string;
}

export interface FlowTest {
  id: number;
  deadline: string;
}

export interface FlowHomework {
  id: number;
  deadline: string;
}

export interface FlowModules {
  topics: FlowTopics[]
}

export interface FlowTopics {
  lessons: FlowLessons[],
  test: FlowTest
  homework: FlowHomework
}

export interface GetDeadlines {
  flow_course_id: number;
  modules: FlowModules[]
  flow_index: number;
  flow_course_name: string;
}
