export interface OpinionParagraph {
  personIndex: number; // 0, 1, 2, 3
  personName: string; // e.g. "James", "Lisa"
  contentEn: string;
  contentVi: string;
}

export interface OpinionQuestion {
  id: number;
  questionNumber: number; // 1 to 7
  question: string;
  correctPersonIndex: number; // 0, 1, 2, 3 (pointing to the original person index)
  explanation: string;
  mnemonicHint: string;
}

export interface OpinionTopic {
  id: string;
  topicNumber: number; // 1 to 5
  title: string;
  titleVi: string;
  category: string;
  people: string[]; // 4 names
  paragraphs: OpinionParagraph[]; // 4 paragraphs
  questions: OpinionQuestion[]; // 7 questions
}

export interface OpinionScoreRecord {
  topicId: string;
  topicTitle: string;
  lastScore: number;
  maxScore: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  isPerfect: boolean;
}
