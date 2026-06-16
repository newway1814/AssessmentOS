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
  templateVersionId?: string;
  templateName?: string;
  durationMinutes: number;
  totalMarksTarget?: number;
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
  totalMarksTarget?: number;
  templateVersionId?: string;
};

export type PaperUpdateInput = PaperCreateInput & {
  status: PaperStatus;
};

export type PaperSectionCreateInput = {
  title: string;
  instructions?: string;
  expectedMarks?: number;
};

export type PaperSectionUpdateInput = PaperSectionCreateInput & {
  order: number;
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
  updatePaper(id: string, input: PaperUpdateInput): Promise<PaperBuilderItem>;
  archivePaper(id: string): Promise<PaperBuilderItem>;
  createSection(
    paperId: string,
    input: PaperSectionCreateInput,
  ): Promise<PaperBuilderItem>;
  updateSection(
    paperId: string,
    sectionId: string,
    input: PaperSectionUpdateInput,
  ): Promise<PaperBuilderItem>;
  addQuestionToSection(
    paperId: string,
    sectionId: string,
    questionId: string,
  ): Promise<PaperBuilderItem>;
  removeQuestionFromSection(
    paperId: string,
    sectionId: string,
    paperQuestionId: string,
  ): Promise<PaperBuilderItem>;
  moveQuestionInSection(
    paperId: string,
    sectionId: string,
    paperQuestionId: string,
    direction: "up" | "down",
  ): Promise<PaperBuilderItem>;
};

export type PaperBuilderMutations = Pick<
  PaperBuilderAdapter,
  | "createPaper"
  | "updatePaper"
  | "archivePaper"
  | "createSection"
  | "updateSection"
  | "addQuestionToSection"
  | "removeQuestionFromSection"
  | "moveQuestionInSection"
>;
