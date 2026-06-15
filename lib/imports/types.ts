import type {
  QuestionType,
  RightsStatus,
  SourceType,
} from "@/lib/domain/constants";

export const importSourceOptions = [
  "PDF",
  "IMAGE_SCAN",
  "DOCX",
  "PASTED_TEXT",
  "SCHOOL_REPOSITORY_BATCH",
  "VERIFIED_EXTERNAL_SOURCE",
] as const;

export const importStatuses = [
  "UPLOADED",
  "NORMALIZING",
  "NEEDS_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;

export type ImportSourceOption = (typeof importSourceOptions)[number];
export type ImportStatus = (typeof importStatuses)[number];
export type NormalizedQuestionReviewStatus =
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EDIT_LATER";

export type NormalizedQuestionCard = {
  id: string;
  prompt: string;
  gradeName: string;
  subjectName: string;
  chapterName: string;
  subtopicName: string;
  marks: number;
  difficulty: string;
  type: QuestionType;
  answerKey: string;
  sourceType: SourceType;
  rightsStatus: RightsStatus;
  sourceTitle: string;
  sourceReference: string;
  status: NormalizedQuestionReviewStatus;
  confidence: number;
};

export type QuestionImportBatch = {
  id: string;
  title: string;
  sourceOption: ImportSourceOption;
  status: ImportStatus;
  submittedBy: string;
  createdAt: string;
  questionCount: number;
  rightsSummary: string;
  pastedText?: string;
  fileName?: string;
  normalizedQuestions: NormalizedQuestionCard[];
};

export type NewImportDraft = {
  sourceOption: ImportSourceOption;
  pastedText: string;
  fileName: string;
  sourceTitle: string;
  sourceReference: string;
  sourceType: SourceType;
  rightsStatus: RightsStatus;
};

export type ImportReadinessItem = {
  id: string;
  label: string;
  isReady: boolean;
  detail: string;
};

export type QuestionImportAdapter = {
  listImports(): Promise<QuestionImportBatch[]>;
  getImport(importId: string): Promise<QuestionImportBatch | undefined>;
  createMockImport(draft: NewImportDraft): Promise<QuestionImportBatch>;
};
