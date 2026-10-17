export interface P4Question {
  id: string;
  question: string;
  questionVi?: string;
  options: string[];
  optionsVi?: string[];
  correct: number; // 0-indexed: 0, 1, 2
  explanation: string;
  keywordClue?: string;
}

export interface P4Speaker {
  speakerId: number;
  speakerName: string;
  speakerGender: 'man' | 'woman';
  topicStance?: string;
  scriptEn: string;
  scriptVi?: string;
  audioUrl?: string;
  questions: P4Question[];
}

export interface ListeningP4Topic {
  id: string;
  title: string;
  titleVi: string;
  category: string;
  audioUrl?: string;
  speakers: P4Speaker[];
}

export interface ListeningP4ScoreRecord {
  topicId: string;
  topicTitle: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
}

