import {Module} from "./module.interface";

export interface GetModules {
  course: {
    id: number;
    name: string;
  }
  modules: Module[]
}
