import { describe, expect, it } from "vitest";

import {
  addQuestionToSection,
  calculatePaperTotalMarks,
  moveQuestionInSection,
  removeQuestionFromSection,
  validatePaper,
} from "@/lib/papers/helpers";
import type { PaperBuilderItem, PaperSectionItem } from "@/lib/papers/types";
import type { QuestionRepositoryItem } from "@/lib/questions/types";

const questionOne = makeQuestion("question-1", 2, true);
const questionTwo = makeQuestion("question-2", 3, false);

describe("paper builder helpers", () => {
  it("calculates total paper marks from sections", () => {
    expect(
      calculatePaperTotalMarks([makeSection([questionOne, questionTwo])]),
    ).toBe(5);
  });

  it("adds, removes, and reorders questions in a section", () => {
    const section = makeSection([questionOne]);
    const withQuestion = addQuestionToSection({
      section,
      question: questionTwo,
    });
    const moved = moveQuestionInSection({
      section: withQuestion,
      paperQuestionId: withQuestion.questions[1]?.id ?? "",
      direction: "up",
    });
    const removed = removeQuestionFromSection({
      section: moved,
      paperQuestionId: moved.questions[0]?.id ?? "",
    });

    expect(withQuestion.questions).toHaveLength(2);
    expect(moved.questions[0]?.question.id).toBe("question-2");
    expect(removed.questions).toHaveLength(1);
    expect(removed.questions[0]?.order).toBe(1);
  });

  it("summarizes obvious validation issues", () => {
    const paper: PaperBuilderItem = {
      id: "paper-1",
      schoolId: "school-1",
      workspaceId: "workspace-1",
      title: "Practice Paper",
      gradeId: "grade-8",
      gradeName: "Grade 8",
      subjectId: "subject-math",
      subjectName: "Mathematics",
      durationMinutes: 45,
      status: "DRAFT",
      updatedAt: "2026-06-15T00:00:00.000Z",
      sections: [
        {
          ...makeSection([questionOne, questionTwo, questionOne]),
          expectedMarks: 10,
        },
      ],
    };

    const summary = validatePaper(paper);

    expect(summary.totalMarks).toBe(7);
    expect(summary.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "SECTION_MARKS_MISMATCH",
        "DUPLICATE_QUESTION",
        "MISSING_ANSWER_KEY",
        "TOTAL_MARKS_MISMATCH",
      ]),
    );
  });
});

function makeSection(questions: QuestionRepositoryItem[]): PaperSectionItem {
  return {
    id: "section-1",
    title: "Section A",
    order: 1,
    expectedMarks: 5,
    questions: questions.map((question, index) => ({
      id: `paper-question-${index + 1}`,
      question,
      order: index + 1,
      marks: question.marks,
    })),
  };
}

function makeQuestion(
  id: string,
  marks: number,
  hasAnswerKey: boolean,
): QuestionRepositoryItem {
  return {
    id,
    schoolId: "school-1",
    workspaceId: "workspace-1",
    sourceId: "source-1",
    subjectId: "subject-math",
    subjectName: "Mathematics",
    gradeId: "grade-8",
    gradeName: "Grade 8",
    type: "SHORT_ANSWER",
    prompt: `Prompt for ${id}`,
    marks,
    difficulty: "Foundational",
    status: "READY",
    source: {
      sourceType: "TEACHER_CREATED",
      title: "Teacher set",
      rightsStatus: "VERIFIED",
      usageRights: "Teacher-created content.",
    },
    answerKey: {
      answer: hasAnswerKey ? "Answer" : "",
      isComplete: hasAnswerKey,
    },
    versionNumber: 1,
    updatedAt: "2026-06-15T00:00:00.000Z",
  };
}
