import { describe, expect, it } from "vitest";

import {
  detectDuplicateQuestions,
  detectMissingAnswerKeys,
  validateSectionMarks,
  validateTotalMarks,
  type PaperSectionForValidation,
} from "./validation";

const sections: PaperSectionForValidation[] = [
  {
    id: "section-a",
    title: "Section A",
    expectedMarks: 5,
    questions: [
      { questionId: "question-1", marks: 2, hasAnswerKey: true },
      { questionId: "question-2", marks: 3, hasAnswerKey: false },
    ],
  },
  {
    id: "section-b",
    title: "Section B",
    expectedMarks: 4,
    questions: [{ questionId: "question-1", marks: 4, hasAnswerKey: true }],
  },
];

describe("paper validation helpers", () => {
  it("validates expected total marks", () => {
    expect(validateTotalMarks({ expectedTotal: 9, sections })).toEqual([]);
    expect(validateTotalMarks({ expectedTotal: 10, sections })).toEqual([
      {
        code: "TOTAL_MARKS_MISMATCH",
        severity: "ERROR",
        message: "Expected 10 marks, but paper contains 9 marks.",
      },
    ]);
  });

  it("detects duplicate questions across sections", () => {
    expect(detectDuplicateQuestions(sections)).toEqual([
      {
        code: "DUPLICATE_QUESTION",
        severity: "WARNING",
        message: "Question question-1 appears more than once in this paper.",
      },
    ]);
  });

  it("detects missing answer keys", () => {
    expect(detectMissingAnswerKeys(sections)).toEqual([
      {
        code: "MISSING_ANSWER_KEY",
        severity: "WARNING",
        message: "Question question-2 in Section A is missing an answer key.",
      },
    ]);
  });

  it("validates section marks", () => {
    const mismatchedSections: PaperSectionForValidation[] = [
      {
        id: "section-c",
        title: "Section C",
        expectedMarks: 6,
        questions: [{ questionId: "question-3", marks: 4, hasAnswerKey: true }],
      },
    ];

    expect(validateSectionMarks(sections)).toEqual([]);
    expect(validateSectionMarks(mismatchedSections)).toEqual([
      {
        code: "SECTION_MARKS_MISMATCH",
        severity: "ERROR",
        message: "Section C expects 6 marks, but contains 4 marks.",
      },
    ]);
  });
});
