export interface P4SubQuestion {
  id: string;
  question: string;
  questionVi?: string;
  options: string[];
  optionsVi?: string[];
  correct: number; // 0, 1, 2
  keyHighlight?: string; // key nhớ tiếng Anh cần to đậm
  keyHighlightVi?: string; // key nhớ tiếng Việt cần to đậm
}

export interface P4PairItem {
  id: string;
  pairIndex: number;
  instruction?: string;
  audioPrompt?: string;
  audioUrl?: string;
  // Gợi ý / Mẹo nhớ 2 key
  tipMnemonic?: string;
  // Lời giải thích / Transcript
  explanationEn?: string;
  explanationVi?: string;
  questions: [P4SubQuestion, P4SubQuestion];
}

export type ListeningP4Mode = 'practice' | 'exam' | 'quiz60';

export interface ListeningP4ScoreRecord {
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
  mode: ListeningP4Mode;
}
