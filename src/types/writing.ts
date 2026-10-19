export interface WritingPart1Item {
  questionNumber: number;
  question: string;
  sampleAnswer?: string;
}

export interface WritingPart2 {
  instruction: string;
  prompt: string;
  wordLimit: string;
  sampleAnswer?: string;
}

export interface WritingPart3Item {
  speaker: string;
  question: string;
  sampleAnswer?: string;
}

export interface WritingPart3 {
  instruction: string;
  items: WritingPart3Item[];
  wordLimit: string;
}

export interface WritingPart4Task {
  prompt: string;
  wordLimit: string;
  sampleAnswer?: string;
}

export interface WritingPart4 {
  context: string;
  task1: WritingPart4Task;
  task2: WritingPart4Task;
}

export interface AptisWritingTopic {
  id: string;
  title: string;
  description: string;
  part1: WritingPart1Item[];
  part2: WritingPart2;
  part3: WritingPart3;
  part4: WritingPart4;
}

export interface WritingUserAnswers {
  part1: Record<number, string>;
  part2: string;
  part3: Record<number, string>;
  part4_friend: string;
  part4_manager: string;
}

export interface WritingCorrectionItem {
  part: string;
  original: string;
  corrected: string;
  type: 'grammar' | 'spelling' | 'vocabulary' | 'tone' | 'word_limit';
  explanation: string;
}

export interface WritingEvaluationReport {
  overallScore: number;
  maxScore: number;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  overallComment: string;
  partScores: {
    part1: { score: number; max: number; feedback: string };
    part2: { score: number; max: number; feedback: string };
    part3: { score: number; max: number; feedback: string };
    part4: { score: number; max: number; feedback: string };
  };
  corrections: WritingCorrectionItem[];
  vocabularySuggestions: Array<{
    originalWord: string;
    suggestedWord: string;
    reason: string;
  }>;
  improvedSample?: {
    part2?: string;
    part3?: string[];
    part4_friend?: string;
    part4_manager?: string;
  };
}

export interface WritingHistoryRecord {
  topicId: string;
  topicTitle: string;
  score: number;
  maxScore: number;
  cefrLevel: string;
  completedAt: string;
}
