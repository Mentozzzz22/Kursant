export interface Answer {
  text: string;
  is_correct: boolean;
}

export interface Question {
  text: string;
  answers: Answer[]
}

export interface Test {
  duration: number;
  questions: Question[]
}
