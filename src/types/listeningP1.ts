export interface ListeningP1Question {
  num: number;
  id: string;
  question: string;
  options: string[];
  correctLetter: 'A' | 'B' | 'C';
  correct: number;
  questionVi: string;
  optionsVi: string[];
  explanation: string;
  part: string;
  setIndex?: number;
}

export interface ListeningP1SetMeta {
  id: string;
  name: string;
  count: number;
  questionStart: number;
  questionEnd: number;
}

export interface ListeningP1Data {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  sets?: ListeningP1SetMeta[];
  questions: ListeningP1Question[];
}

export type ListeningP1Mode = 'practice' | 'exam';

export interface ListeningP1ScoreRecord {
  lastCompletedAt: string;
  score: number;
  total: number;
  percentage: number;
  timeTakenSeconds: number;
  mode: ListeningP1Mode;
}
