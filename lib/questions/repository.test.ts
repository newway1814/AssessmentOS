import { describe, expect, it } from "vitest";

import { defaultQuestionFilters, filterQuestions } from "./filters";
import type { QuestionRepositoryItem } from "./types";

const questions: QuestionRepositoryItem[] = [
  {
    id: "question-1",
    schoolId: "school-1",
    workspaceId: "workspace-1",
    sourceId: "source-1",
    subjectId: "math",
    subjectName: "Mathematics",
    gradeId: "grade-8",
    gradeName: "Grade 8",
    chapterName: "Linear Equations",
    subtopicName: "Solving equations",
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
    answerKey: { answer: "x = 5", isComplete: true },
    versionNumber: 1,
    updatedAt: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "question-2",
    schoolId: "school-1",
    workspaceId: "workspace-1",
    sourceId: "source-2",
    subjectId: "science",
    subjectName: "Science",
    gradeId: "grade-7",
    gradeName: "Grade 7",
    chapterName: "Plant Systems",
    subtopicName: "Photosynthesis",
    type: "LONG_ANSWER",
    prompt: "Explain photosynthesis.",
    marks: 5,
    difficulty: "Intermediate",
    status: "DRAFT",
    source: {
      sourceType: "SCHOOL_OWNED",
      title: "Science bank",
      rightsStatus: "NEEDS_REVIEW",
      usageRights: "School-owned content.",
    },
    answerKey: { answer: "", isComplete: false },
    versionNumber: 1,
    updatedAt: "2026-06-15T00:00:00.000Z",
  },
];

describe("filterQuestions", () => {
  it("filters by search text", () => {
    const result = filterQuestions(questions, {
      ...defaultQuestionFilters,
      search: "photo",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("question-2");
  });

  it("filters by metadata and rights", () => {
    const result = filterQuestions(questions, {
      ...defaultQuestionFilters,
      grade: "Grade 8",
      sourceType: "TEACHER_CREATED",
      rightsStatus: "VERIFIED",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("question-1");
  });
});
