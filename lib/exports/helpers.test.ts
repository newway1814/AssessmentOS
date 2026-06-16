import { describe, expect, it } from "vitest";

import {
  buildExportPreview,
  buildExportReadinessSummary,
  countMissingAnswerKeys,
  isExportReady,
} from "@/lib/exports/helpers";
import type { PaperBuilderItem } from "@/lib/papers/types";
import type { SchoolTemplateItem } from "@/lib/templates/types";
import type { QuestionRepositoryItem } from "@/lib/questions/types";

describe("export helpers", () => {
  it("builds readiness checklist from paper and template state", () => {
    const preview = buildExportPreview({
      paper: makePaper([makeQuestion("question-1", true)]),
      template: makeTemplate(),
    });

    expect(preview.totalMarks).toBe(2);
    expect(isExportReady(preview.checklist)).toBe(true);
  });

  it("flags missing answer keys", () => {
    const paper = makePaper([makeQuestion("question-1", false)]);
    const preview = buildExportPreview({ paper, template: makeTemplate() });

    expect(countMissingAnswerKeys(paper)).toBe(1);
    expect(
      preview.checklist.find((item) => item.id === "answer-keys")?.isReady,
    ).toBe(false);
  });

  it("builds a persistable readiness summary", () => {
    const preview = buildExportPreview({
      paper: makePaper([makeQuestion("question-1", true)]),
      template: makeTemplate(),
    });
    const summary = buildExportReadinessSummary({
      answerKeyVisible: true,
      checklist: preview.checklist,
      copyType: "TEACHER",
      status: "GENERATED_PLACEHOLDER",
    });

    expect(summary.ready).toBe(true);
    expect(summary.answerKeyVisible).toBe(true);
    expect(summary.previewMode).toBe("ASSESSMENT");
    expect(summary.status).toBe("GENERATED_PLACEHOLDER");
  });
});

function makePaper(questions: QuestionRepositoryItem[]): PaperBuilderItem {
  return {
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
        id: "section-a",
        title: "Section A",
        order: 1,
        expectedMarks: 2,
        questions: questions.map((question, index) => ({
          id: `paper-question-${index + 1}`,
          question,
          order: index + 1,
          marks: question.marks,
        })),
      },
    ],
  };
}

function makeQuestion(
  id: string,
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
    prompt: "Solve for x.",
    marks: 2,
    difficulty: "Foundational",
    status: "READY",
    source: {
      sourceType: "TEACHER_CREATED",
      title: "Teacher set",
      rightsStatus: "VERIFIED",
      usageRights: "Teacher-created content.",
    },
    answerKey: {
      answer: hasAnswerKey ? "x = 5" : "",
      isComplete: hasAnswerKey,
    },
    versionNumber: 1,
    updatedAt: "2026-06-15T00:00:00.000Z",
  };
}

function makeTemplate(): SchoolTemplateItem {
  return {
    id: "template-1",
    schoolId: "school-1",
    workspaceId: "workspace-1",
    name: "Standard Exam",
    type: "EXAM",
    schoolName: "Riverside International School",
    headerText: "End of Term Assessment",
    footerText: "Internal use only.",
    examInstructions: "Answer all questions.",
    studentMetadataFields: ["Name", "Roll number", "Class", "Section", "Date"],
    defaultDurationMinutes: 45,
    defaultTotalMarks: 2,
    sectionPattern: [
      { title: "Section A", instructions: "Answer all.", expectedMarks: 2 },
    ],
    pageRuleNotes: "A4 layout.",
    status: "ACTIVE",
    versionNumber: 1,
    updatedAt: "2026-06-15T00:00:00.000Z",
  };
}
