import { questionRepository } from "@/lib/questions/repository";
import type {
  PaperBuilderAdapter,
  PaperBuilderItem,
  PaperCreateInput,
} from "@/lib/papers/types";
import type { QuestionRepositoryItem } from "@/lib/questions/types";

const demoSchoolId = "school-riverside";
const demoWorkspaceId = "workspace-academic-coordination";

let papers: PaperBuilderItem[] | undefined;

export const mockPaperRepository: PaperBuilderAdapter = {
  async listPapers() {
    return getPapers();
  },

  async getPaper(id) {
    return (await getPapers()).find((paper) => paper.id === id);
  },

  async createPaper(input: PaperCreateInput) {
    const nextPaper: PaperBuilderItem = {
      id: `paper-${Date.now()}`,
      schoolId: demoSchoolId,
      workspaceId: demoWorkspaceId,
      title: input.title,
      gradeId: input.gradeId,
      gradeName: input.gradeName,
      subjectId: input.subjectId,
      subjectName: input.subjectName,
      durationMinutes: input.durationMinutes,
      status: "DRAFT",
      sections: [
        {
          id: `section-${Date.now()}`,
          title: "Section A",
          instructions: "Answer all questions.",
          order: 1,
          expectedMarks: 0,
          questions: [],
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    papers = [nextPaper, ...(await getPapers())];
    return nextPaper;
  },
};

async function getPapers() {
  if (!papers) {
    papers = await buildDemoPapers();
  }

  return [...papers];
}

async function buildDemoPapers(): Promise<PaperBuilderItem[]> {
  const questions = await questionRepository.listQuestions();
  const algebraQuestion = questions.find(
    (question) => question.id === "question-linear-equations-1",
  );
  const scienceQuestion = questions.find(
    (question) => question.id === "question-photosynthesis-1",
  );
  const historyQuestion = questions.find(
    (question) => question.id === "question-history-source-1",
  );

  return [
    {
      id: "paper-grade-8-algebra-checkpoint",
      schoolId: demoSchoolId,
      workspaceId: demoWorkspaceId,
      title: "Grade 8 Algebra Checkpoint",
      gradeId: "grade-8",
      gradeName: "Grade 8",
      subjectId: "subject-math",
      subjectName: "Mathematics",
      durationMinutes: 45,
      status: "DRAFT",
      updatedAt: "2026-06-15T10:00:00.000Z",
      sections: [
        {
          id: "section-algebra-a",
          title: "Section A",
          instructions: "Answer all questions. Show working where appropriate.",
          order: 1,
          expectedMarks: 6,
          questions: algebraQuestion
            ? [
                {
                  id: "paper-question-algebra-1",
                  question: algebraQuestion,
                  order: 1,
                  marks: algebraQuestion.marks,
                },
              ]
            : [],
        },
        {
          id: "section-algebra-b",
          title: "Section B",
          instructions: "Extended response questions.",
          order: 2,
          expectedMarks: 4,
          questions: [],
        },
      ],
    },
    {
      id: "paper-interdisciplinary-practice",
      schoolId: demoSchoolId,
      workspaceId: demoWorkspaceId,
      title: "Interdisciplinary Practice Paper",
      gradeId: "grade-9",
      gradeName: "Grade 9",
      subjectId: "subject-history",
      subjectName: "History",
      durationMinutes: 60,
      status: "VALIDATING",
      updatedAt: "2026-06-14T16:20:00.000Z",
      sections: [
        {
          id: "section-practice-a",
          title: "Section A",
          instructions: "Use evidence from the prompt where relevant.",
          order: 1,
          expectedMarks: 9,
          questions: [historyQuestion, scienceQuestion]
            .filter(isQuestion)
            .map((question, index) => ({
              id: `paper-question-practice-${index + 1}`,
              question,
              order: index + 1,
              marks: question.marks,
            })),
        },
      ],
    },
  ];
}

function isQuestion(
  question: QuestionRepositoryItem | undefined,
): question is QuestionRepositoryItem {
  return Boolean(question);
}
