import { describe, expect, it } from "vitest";

import {
  buildImportReadiness,
  countQuestionsByReviewStatus,
  createMockNormalizedQuestions,
} from "@/lib/imports/helpers";
import type { QuestionImportBatch } from "@/lib/imports/types";

const batch: QuestionImportBatch = {
  id: "import-test",
  title: "Import test",
  sourceOption: "PASTED_TEXT",
  status: "NEEDS_REVIEW",
  submittedBy: "Teacher",
  createdAt: "2026-06-15T00:00:00.000Z",
  questionCount: 2,
  rightsSummary: "Teacher-created.",
  pastedText: "Question text",
  normalizedQuestions: [
    {
      id: "q1",
      prompt: "Question 1",
      gradeName: "Grade 8",
      subjectName: "Mathematics",
      chapterName: "Algebra",
      subtopicName: "Equations",
      marks: 2,
      difficulty: "Foundational",
      type: "SHORT_ANSWER",
      answerKey: "Answer",
      sourceType: "TEACHER_CREATED",
      rightsStatus: "VERIFIED",
      sourceTitle: "Teacher worksheet",
      sourceReference: "Internal",
      status: "APPROVED",
      confidence: 0.9,
    },
    {
      id: "q2",
      prompt: "Question 2",
      gradeName: "Grade 8",
      subjectName: "Mathematics",
      chapterName: "Algebra",
      subtopicName: "Equations",
      marks: 3,
      difficulty: "Practice",
      type: "LONG_ANSWER",
      answerKey: "",
      sourceType: "SCHOOL_OWNED",
      rightsStatus: "RESTRICTED",
      sourceTitle: "Old paper",
      sourceReference: "Archive",
      status: "REJECTED",
      confidence: 0.7,
    },
  ],
};

describe("import helpers", () => {
  it("flags restricted rights and missing answer keys", () => {
    const readiness = buildImportReadiness(batch);

    expect(readiness.find((item) => item.id === "rights")?.isReady).toBe(false);
    expect(readiness.find((item) => item.id === "answer-keys")?.isReady).toBe(
      false,
    );
  });

  it("counts normalized question review states", () => {
    expect(countQuestionsByReviewStatus(batch.normalizedQuestions)).toEqual({
      APPROVED: 1,
      EDIT_LATER: 0,
      NEEDS_REVIEW: 0,
      REJECTED: 1,
    });
  });

  it("creates mock normalized questions from a draft boundary", () => {
    const questions = createMockNormalizedQuestions({
      sourceOption: "PASTED_TEXT",
      pastedText: "Find the value of x.",
      fileName: "",
      sourceTitle: "Teacher paste",
      sourceReference: "Internal worksheet",
      sourceType: "TEACHER_CREATED",
      rightsStatus: "VERIFIED",
    });

    expect(questions).toHaveLength(2);
    expect(questions[0]?.prompt).toContain("Find the value of x.");
    expect(questions[0]?.sourceTitle).toBe("Teacher paste");
  });
});
