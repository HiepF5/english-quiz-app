export interface SentenceItem {
  id: string;
  originalIndex: number; // 1-based correct order (1, 2, 3...)
  textEn: string;
  textVi: string;
  isFixed?: boolean; // Whether it is the given lead sentence (câu cho sẵn)
  keyword?: string; // Clue keyword or phrase
}

export interface OrderingTopic {
  id: string;
  title: string;
  titleVi: string;
  category: string;
  hasFixedLead: boolean;
  keywordChain: string[];
  rawKeywordsSummary?: string;
  sentences: SentenceItem[];
}

export interface OrderingScoreRecord {
  topicId: string;
  topicTitle: string;
  lastScore: number;
  maxScore: number;
  totalSentences: number;
  percentage: number;
  completedAt: string;
  isPerfect: boolean;
}
