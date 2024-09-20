import {Topic} from "./topic.interface";

export interface GetTopic {
  module: {
    id: number,
    name: string,
    course_id: number
    index: number
  }
  topics: Topic[]
}
