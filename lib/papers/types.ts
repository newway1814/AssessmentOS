import type { PaperStatus } from "@/lib/domain/constants";
import type { ValidationIssue } from "@/lib/domain/validation";
import type { QuestionRepositoryItem } from "@/lib/questions/types";

export type PaperQuestionItem = {
  id: string;
  question: QuestionRepositoryItem;
  order: number;
  marks: number;
};

export type PaperSectionItem = {
  id: string;
  title: string;
  instructions?: string;
  order: number;
  expectedMarks?: number;
  questions: PaperQuestionItem[];
};

export type PaperBuilderItem = {
  id: string;
  schoolId: string;
  workspaceId: string;
  title: string;
  gradeId: string;
  gradeName: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
  status: PaperStatus;
  sections: PaperSectionItem[];
  updatedAt: string;
};

export type PaperCreateInput = {
  title: string;
  gradeId: string;
  gradeName: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
};

export type PaperValidationSummary = {
  totalMarks: number;
  sectionMarks: Array<{
    sectionId: string;
    title: string;
    marks: number;
    expectedMarks?: number;
  }>;
  issues: ValidationIssue[];
};

export type PaperBuilderAdapter = {
  listPapers(): Promise<PaperBuilderItem[]>;
  getPaper(id: string): Promise<PaperBuilderItem | undefined>;
  createPaper(input: PaperCreateInput): Promise<PaperBuilderItem>;
};
