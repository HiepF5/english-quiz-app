export interface HeadingParagraph {
  id: string;
  paragraphIndex: number; // 1 to 7
  correctHeading: string; // The correct heading title
  oneWordKeyword: string; // The 1-word summary e.g. "Life", "Benefits", "finance"
  mnemonicHint: string; // The mnemonic clue e.g. "Linh (Life)", "Buộc (Benefits)"
  contentEn: string; // Paragraph in English
  contentVi: string; // Paragraph in Vietnamese
  explanation?: string;
}

export interface HeadingsTopic {
  id: string;
  title: string;
  titleVi: string;
  category: string;
  mnemonicFormula: string; // e.g. "Linh (Life) - Buộc (Benefits) - Phải (finance ) - Có (Challenges)..."
  allHeadings: string[]; // List of all headings for this topic
  paragraphs: HeadingParagraph[];
}

export interface HeadingsScoreRecord {
  topicId: string;
  topicTitle: string;
  lastScore: number;
  maxScore: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  isPerfect: boolean;
}
