export interface Question {
  id: number;
  part: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizSet {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  timeLimitMinutes: number;
  questions: Question[];
}

export type QuizMode = 'practice' | 'exam';

export interface QuizHistoryRecord {
  quizId: string;
  quizTitle: string;
  lastCompletedAt: string;
  timesCompleted: number;
  highestScore: number;
  totalQuestions: number;
  highestPercentage: number;
  lastMode: QuizMode;
}

export interface QuizStats {
  completedCount: number;
  highestScore: number;
  averageScore: number;
}
