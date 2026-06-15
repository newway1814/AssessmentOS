import type {
  QuestionType,
  RightsStatus,
  SourceType,
} from "@/lib/domain/constants";
import type { QuestionInput, QuestionSourceInput } from "@/lib/domain/schemas";

export type QuestionRepositoryAnswerKey = {
  answer: string;
  explanation?: string;
  isComplete: boolean;
};

export type QuestionRepositoryItem = {
  id: string;
  schoolId: string;
  workspaceId: string;
  sourceId: string;
  subjectId: string;
  subjectName: string;
  gradeId: string;
  gradeName: string;
  chapterId?: string;
  chapterName?: string;
  subtopicId?: string;
  subtopicName?: string;
  type: QuestionType;
  prompt: string;
  marks: number;
  difficulty?: string;
  status: "DRAFT" | "READY" | "NEEDS_REVIEW" | "ARCHIVED";
  source: QuestionSourceInput;
  answerKey: QuestionRepositoryAnswerKey;
  versionNumber: number;
  updatedAt: string;
};

export type QuestionRepositoryFilters = {
  search: string;
  grade: string;
  subject: string;
  chapter: string;
  subtopic: string;
  marks: string;
  difficulty: string;
  sourceType: SourceType | "ALL";
  rightsStatus: RightsStatus | "ALL";
};

export type QuestionRepositoryFormValues = Omit<
  QuestionInput,
  "schoolId" | "workspaceId" | "sourceId"
> & {
  subjectName: string;
  gradeName: string;
  chapterName?: string;
  subtopicName?: string;
  source: QuestionSourceInput;
  answerKey: QuestionRepositoryAnswerKey;
};

export type QuestionRepositoryAdapter = {
  listQuestions(): Promise<QuestionRepositoryItem[]>;
  createQuestion(
    input: QuestionRepositoryFormValues,
  ): Promise<QuestionRepositoryItem>;
  updateQuestion(
    id: string,
    input: QuestionRepositoryFormValues,
  ): Promise<QuestionRepositoryItem>;
  archiveQuestion(id: string): Promise<QuestionRepositoryItem>;
};
