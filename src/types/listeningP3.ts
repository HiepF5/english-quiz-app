export type P3Speaker = 'man' | 'woman';
export type P3Answer = 'man' | 'woman' | 'both';

export interface P3DialogueTurn {
  id: string;
  speaker: P3Speaker;
  text: string;
  textVi?: string;
}

export interface P3Question {
  id: number;
  statement: string;
  statementVi?: string;
  correct: P3Answer;
  explanation: string;
  keywordClue?: string;
}

export interface ListeningP3Topic {
  id: string;
  title: string;
  keyword?: string;
  titleVi: string;
  category: string;
  audioUrl?: string;
  mnemonicPoem?: string;
  dialogue: P3DialogueTurn[];
  questions: P3Question[];
}

export interface ListeningP3ScoreRecord {
  topicId: string;
  topicTitle: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
}

