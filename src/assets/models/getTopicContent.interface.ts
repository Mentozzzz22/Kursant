import {Lesson} from "./lesson.interface";
import {Test} from "./test.interface";
import {Homework} from "./homework.interface";

export interface GetTopicContent {
  topic: {
    id: number;
    name: string;
    module_id: number;
    index: number;
  },
  lessons: Lesson[],
  test: Test,
  homework: Homework
}
