import {
  questionInputSchema,
  questionSourceInputSchema,
} from "@/lib/domain/schemas";
import type {
  QuestionRepositoryAdapter,
  QuestionRepositoryFormValues,
  QuestionRepositoryItem,
} from "@/lib/questions/types";

const demoSchoolId = "school-riverside";
const demoWorkspaceId = "workspace-academic-coordination";

let questions: QuestionRepositoryItem[] = [
  {
    id: "question-linear-equations-1",
    schoolId: demoSchoolId,
    workspaceId: demoWorkspaceId,
    sourceId: "source-teacher-algebra",
    subjectId: "subject-math",
    subjectName: "Mathematics",
    gradeId: "grade-8",
    gradeName: "Grade 8",
    chapterId: "chapter-linear-equations",
    chapterName: "Linear Equations",
    subtopicId: "subtopic-one-variable",
    subtopicName: "Solving one-variable equations",
    type: "SHORT_ANSWER",
    prompt: "Solve for x: 3x + 5 = 20.",
    marks: 2,
    difficulty: "Foundational",
    status: "READY",
    source: {
      sourceType: "TEACHER_CREATED",
      title: "Teacher-authored Grade 8 algebra set",
      author: "Maya Tan",
      owner: "Riverside International School",
      rightsStatus: "VERIFIED",
      usageRights:
        "Teacher-created content for Riverside International School internal assessment use.",
    },
    answerKey: {
      answer: "x = 5",
      explanation: "3x = 15, therefore x = 5.",
      isComplete: true,
    },
    versionNumber: 1,
    updatedAt: "2026-06-15T09:00:00.000Z",
  },
  {
    id: "question-photosynthesis-1",
    schoolId: demoSchoolId,
    workspaceId: demoWorkspaceId,
    sourceId: "source-school-science",
    subjectId: "subject-science",
    subjectName: "Science",
    gradeId: "grade-7",
    gradeName: "Grade 7",
    chapterId: "chapter-plants",
    chapterName: "Plant Systems",
    subtopicId: "subtopic-photosynthesis",
    subtopicName: "Photosynthesis",
    type: "LONG_ANSWER",
    prompt:
      "Explain how light intensity can affect the rate of photosynthesis in a plant.",
    marks: 5,
    difficulty: "Intermediate",
    status: "NEEDS_REVIEW",
    source: {
      sourceType: "SCHOOL_OWNED",
      title: "Riverside Science Department question bank",
      owner: "Riverside International School",
      rightsStatus: "VERIFIED",
      usageRights: "School-owned content cleared for internal classroom use.",
    },
    answerKey: {
      answer: "",
      explanation: "",
      isComplete: false,
    },
    versionNumber: 2,
    updatedAt: "2026-06-14T11:30:00.000Z",
  },
  {
    id: "question-history-source-1",
    schoolId: demoSchoolId,
    workspaceId: demoWorkspaceId,
    sourceId: "source-open-history",
    subjectId: "subject-history",
    subjectName: "History",
    gradeId: "grade-9",
    gradeName: "Grade 9",
    chapterId: "chapter-industrialisation",
    chapterName: "Industrialisation",
    subtopicId: "subtopic-primary-sources",
    subtopicName: "Primary source interpretation",
    type: "SHORT_ANSWER",
    prompt:
      "Identify two limitations of using a factory owner's diary as evidence about worker conditions.",
    marks: 4,
    difficulty: "Advanced",
    status: "DRAFT",
    source: {
      sourceType: "OPEN",
      title: "Open classroom source analysis prompt",
      author: "Open History Project",
      license: "CC BY 4.0",
      rightsStatus: "NEEDS_REVIEW",
      usageRights:
        "Open educational content. Attribution and license metadata require coordinator review before export.",
      attributionText: "Open History Project, CC BY 4.0",
      originalUrl: "https://example.org/open-history",
    },
    answerKey: {
      answer:
        "The diary may be biased toward the owner's perspective and may omit worker experiences.",
      explanation:
        "Accept equivalent limitations that address perspective and completeness.",
      isComplete: true,
    },
    versionNumber: 1,
    updatedAt: "2026-06-13T15:45:00.000Z",
  },
];

export const mockQuestionRepository: QuestionRepositoryAdapter = {
  async listQuestions() {
    return [...questions];
  },

  async createQuestion(input) {
    const parsed = parseQuestionForm(input);
    const nextQuestion: QuestionRepositoryItem = {
      id: `question-${Date.now()}`,
      schoolId: demoSchoolId,
      workspaceId: demoWorkspaceId,
      sourceId: `source-${Date.now()}`,
      ...parsed,
      status: parsed.answerKey.isComplete ? "READY" : "DRAFT",
      versionNumber: 1,
      updatedAt: new Date().toISOString(),
    };

    questions = [nextQuestion, ...questions];
    return nextQuestion;
  },

  async updateQuestion(id, input) {
    const parsed = parseQuestionForm(input);
    let updatedQuestion: QuestionRepositoryItem | undefined;

    questions = questions.map((question) => {
      if (question.id !== id) {
        return question;
      }

      updatedQuestion = {
        ...question,
        ...parsed,
        status: question.status === "ARCHIVED" ? "ARCHIVED" : question.status,
        versionNumber: question.versionNumber + 1,
        updatedAt: new Date().toISOString(),
      };

      return updatedQuestion;
    });

    if (!updatedQuestion) {
      throw new Error(`Question ${id} was not found.`);
    }

    return updatedQuestion;
  },

  async archiveQuestion(id) {
    let archivedQuestion: QuestionRepositoryItem | undefined;

    questions = questions.map((question) => {
      if (question.id !== id) {
        return question;
      }

      archivedQuestion = {
        ...question,
        status: "ARCHIVED",
        updatedAt: new Date().toISOString(),
      };

      return archivedQuestion;
    });

    if (!archivedQuestion) {
      throw new Error(`Question ${id} was not found.`);
    }

    return archivedQuestion;
  },
};

function parseQuestionForm(
  input: QuestionRepositoryFormValues,
): Omit<
  QuestionRepositoryItem,
  | "id"
  | "schoolId"
  | "workspaceId"
  | "sourceId"
  | "status"
  | "versionNumber"
  | "updatedAt"
> {
  const question = questionInputSchema.parse({
    schoolId: demoSchoolId,
    workspaceId: demoWorkspaceId,
    sourceId: "source-form",
    subjectId: input.subjectId,
    gradeId: input.gradeId,
    chapterId: input.chapterId,
    subtopicId: input.subtopicId,
    type: input.type,
    prompt: input.prompt,
    marks: input.marks,
    difficulty: input.difficulty,
  });
  const source = questionSourceInputSchema.parse(input.source);

  return {
    subjectId: question.subjectId,
    subjectName: input.subjectName,
    gradeId: question.gradeId,
    gradeName: input.gradeName,
    chapterId: question.chapterId,
    chapterName: input.chapterName,
    subtopicId: question.subtopicId,
    subtopicName: input.subtopicName,
    type: question.type,
    prompt: question.prompt,
    marks: question.marks,
    difficulty: question.difficulty,
    source,
    answerKey: input.answerKey,
  };
}
