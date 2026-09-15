export interface TranslationItem {
  id: number;
  topic: string;
  originalEnglishQuestion: string;
  originalEnglishAnswer: string;
  vietnamesePromptQuestion: string;
  vietnamesePromptAnswer: string;
}

export interface TranslationExercise {
  id: string;
  title: string;
  description: string;
  rawInputText: string;
  createdAt: string;
  items: TranslationItem[];
}

export interface ItemFeedback {
  itemId: number;
  topic: string;
  originalEnglish: string;
  userTranslation: string;
  score: number; // 0 - 10
  correctedEnglish: string;
  grammarErrors: string[];
  vocabularySuggestions: string[];
  explanation: string;
}

export interface TranslationGradeReport {
  exerciseId: string;
  exerciseTitle: string;
  gradedAt: string;
  overallScore: number;
  overallPercentage: number;
  evaluationComment: string;
  feedbackItems: ItemFeedback[];
}

export interface TranslationHistoryRecord {
  id: string;
  exercise: TranslationExercise;
  userTranslations: Record<number, string>;
  report: TranslationGradeReport;
}
