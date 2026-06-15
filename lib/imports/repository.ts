import { createMockNormalizedQuestions } from "@/lib/imports/helpers";
import type {
  NewImportDraft,
  QuestionImportAdapter,
  QuestionImportBatch,
} from "@/lib/imports/types";

const mockImports: QuestionImportBatch[] = [
  {
    id: "import-grade-8-algebra-paste",
    title: "Grade 8 algebra worksheet paste",
    sourceOption: "PASTED_TEXT",
    status: "NEEDS_REVIEW",
    submittedBy: "Maya Rao",
    createdAt: "2026-06-10T09:30:00.000Z",
    questionCount: 2,
    rightsSummary: "Teacher-created content, school usage approved.",
    pastedText: "Solve 3x + 7 = 28. Explain each step.",
    normalizedQuestions: [
      {
        id: "normalized-algebra-1",
        prompt: "Solve 3x + 7 = 28 and show each step.",
        gradeName: "Grade 8",
        subjectName: "Mathematics",
        chapterName: "Linear Equations",
        subtopicName: "Solving one-variable equations",
        marks: 3,
        difficulty: "Foundational",
        type: "SHORT_ANSWER",
        answerKey: "x = 7",
        sourceType: "TEACHER_CREATED",
        rightsStatus: "VERIFIED",
        sourceTitle: "Grade 8 algebra worksheet paste",
        sourceReference: "Teacher-authored worksheet, June 2026",
        status: "NEEDS_REVIEW",
        confidence: 0.92,
      },
      {
        id: "normalized-algebra-2",
        prompt:
          "Write one real-world situation represented by 4x + 10 = 38, then solve for x.",
        gradeName: "Grade 8",
        subjectName: "Mathematics",
        chapterName: "Linear Equations",
        subtopicName: "Word problems",
        marks: 5,
        difficulty: "Application",
        type: "LONG_ANSWER",
        answerKey:
          "Example: four equal items plus a 10 rupee fee total 38 rupees. x = 7.",
        sourceType: "TEACHER_CREATED",
        rightsStatus: "VERIFIED",
        sourceTitle: "Grade 8 algebra worksheet paste",
        sourceReference: "Teacher-authored worksheet, June 2026",
        status: "NEEDS_REVIEW",
        confidence: 0.86,
      },
    ],
  },
  {
    id: "import-science-scan-placeholder",
    title: "Science scan placeholder",
    sourceOption: "IMAGE_SCAN",
    status: "UPLOADED",
    submittedBy: "Arjun Mehta",
    createdAt: "2026-06-08T11:10:00.000Z",
    questionCount: 0,
    rightsSummary: "Awaiting OCR/normalization placeholder review.",
    fileName: "grade-6-photosynthesis-scan.png",
    normalizedQuestions: [],
  },
  {
    id: "import-partner-bank-sample",
    title: "Verified partner sample batch",
    sourceOption: "VERIFIED_EXTERNAL_SOURCE",
    status: "APPROVED",
    submittedBy: "Academic coordination",
    createdAt: "2026-06-05T14:00:00.000Z",
    questionCount: 1,
    rightsSummary: "Verified partner content metadata retained.",
    fileName: "partner-batch-reference.csv",
    normalizedQuestions: [
      {
        id: "normalized-partner-1",
        prompt:
          "Identify the independent variable in a plant growth experiment.",
        gradeName: "Grade 6",
        subjectName: "Science",
        chapterName: "Scientific Method",
        subtopicName: "Variables",
        marks: 2,
        difficulty: "Foundational",
        type: "SHORT_ANSWER",
        answerKey: "The condition intentionally changed by the investigator.",
        sourceType: "VERIFIED_PARTNER",
        rightsStatus: "VERIFIED",
        sourceTitle: "Partner assessment item bank",
        sourceReference: "Partner agreement AO-DEMO-2026",
        status: "APPROVED",
        confidence: 0.95,
      },
    ],
  },
];

export const importRepository: QuestionImportAdapter = {
  async listImports() {
    return mockImports;
  },

  async getImport(importId) {
    return mockImports.find((item) => item.id === importId);
  },

  async createMockImport(draft: NewImportDraft) {
    const normalizedQuestions = createMockNormalizedQuestions(draft);
    return {
      id: `import-${Date.now()}`,
      title: draft.sourceTitle || draft.fileName || "New import draft",
      sourceOption: draft.sourceOption,
      status: "NEEDS_REVIEW",
      submittedBy: "Current teacher",
      createdAt: new Date().toISOString(),
      questionCount: normalizedQuestions.length,
      rightsSummary:
        "Mock normalization only. Rights metadata must be reviewed before repository approval.",
      pastedText: draft.pastedText,
      fileName: draft.fileName || undefined,
      normalizedQuestions,
    };
  },
};
