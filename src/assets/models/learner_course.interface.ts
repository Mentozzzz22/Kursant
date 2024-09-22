export interface LearnerHomework {
  id: number;
  status: string
}

export interface LearnerTest {
  id: number;
  status: string;
}

export interface LearnerLessons {
  id: number;
  status: string;
  name: string;
  isAvailable?: boolean;
}

export interface LearnerTopics {
  name: string;
  status: string;
  lessons: LearnerLessons[]
  test: LearnerTest;
  homework: LearnerHomework;
}

export interface LearnerModules {
  name: string;
  status: string;
  topics: LearnerTopics[];
}

export interface LearnerCourse {
  id: number;
  name: string;
  poster: string;
  teacher_fullname: string;
  modules_count: number;
  lessons_count: number;
  progress: number;
  modules: LearnerModules[];
}
