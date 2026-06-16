import type {
  ImportReadinessItem,
  NewImportDraft,
  NormalizedQuestionCard,
  QuestionImportBatch,
} from "@/lib/imports/types";

const rightsWarning =
  "Imported content must be school-owned, teacher-created, licensed, open, public-domain, or verified partner content.";

export function buildImportReadiness(
  batch: QuestionImportBatch,
): ImportReadinessItem[] {
  const rejectedCount = batch.normalizedQuestions.filter(
    (question) => question.status === "REJECTED",
  ).length;
  const missingAnswerKeys = batch.normalizedQuestions.filter(
    (question) => question.answerKey.trim().length === 0,
  ).length;
  const restrictedRights = batch.normalizedQuestions.filter(
    (question) => question.rightsStatus === "RESTRICTED",
  ).length;

  return [
    {
      id: "source",
      label: "Source captured",
      isReady: Boolean(batch.fileName ?? batch.pastedText),
      detail: batch.fileName
        ? `Import source file: ${batch.fileName}.`
        : "Pasted text source is attached to this batch.",
    },
    {
      id: "rights",
      label: "Usage rights",
      isReady: restrictedRights === 0,
      detail:
        restrictedRights === 0
          ? rightsWarning
          : `${restrictedRights} normalized questions need rights review. ${rightsWarning}`,
    },
    {
      id: "answer-keys",
      label: "Answer keys",
      isReady: missingAnswerKeys === 0,
      detail:
        missingAnswerKeys === 0
          ? "All normalized cards include answer key text."
          : `${missingAnswerKeys} cards are missing answer key text.`,
    },
    {
      id: "review",
      label: "Review decision",
      isReady: rejectedCount < batch.normalizedQuestions.length,
      detail:
        rejectedCount < batch.normalizedQuestions.length
          ? "At least one normalized card can be approved or edited later."
          : "All normalized cards are currently rejected.",
    },
  ];
}

export function countQuestionsByReviewStatus(
  questions: NormalizedQuestionCard[],
) {
  return questions.reduce(
    (counts, question) => ({
      ...counts,
      [question.status]: counts[question.status] + 1,
    }),
    { APPROVED: 0, EDIT_LATER: 0, NEEDS_REVIEW: 0, REJECTED: 0 },
  );
}

export function createMockNormalizedQuestions(
  draft: NewImportDraft,
): NormalizedQuestionCard[] {
  const baseSourceTitle =
    draft.sourceTitle.trim() || draft.fileName || "Teacher import draft";
  const sourceReference =
    draft.sourceReference.trim() ||
    (draft.sourceOption === "PASTED_TEXT"
      ? "Pasted text submitted by teacher"
      : "Upload placeholder reference");

  return [
    {
      id: `normalized-${Date.now()}-1`,
      prompt:
        draft.pastedText.trim().split(/\n+/)[0]?.slice(0, 220) ||
        "Solve 3x + 7 = 28 and show each step.",
      gradeName: "Grade 8",
      subjectName: "Mathematics",
      chapterName: "Linear Equations",
      subtopicName: "Solving one-variable equations",
      marks: 3,
      difficulty: "Foundational",
      type: "SHORT_ANSWER",
      answerKey: "x = 7",
      sourceType: draft.sourceType,
      rightsStatus: draft.rightsStatus,
      sourceTitle: baseSourceTitle,
      sourceReference,
      usageRights: usageRightsForDraft(draft),
      status: "NEEDS_REVIEW",
      confidence: 0.91,
    },
    {
      id: `normalized-${Date.now()}-2`,
      prompt:
        "A rectangle has length 12 cm and width 5 cm. Find its perimeter and explain the formula used.",
      gradeName: "Grade 7",
      subjectName: "Mathematics",
      chapterName: "Mensuration",
      subtopicName: "Perimeter of rectangles",
      marks: 4,
      difficulty: "Practice",
      type: "LONG_ANSWER",
      answerKey: "Perimeter = 2(12 + 5) = 34 cm.",
      sourceType: draft.sourceType,
      rightsStatus: draft.rightsStatus,
      sourceTitle: baseSourceTitle,
      sourceReference,
      usageRights: usageRightsForDraft(draft),
      status: "NEEDS_REVIEW",
      confidence: 0.84,
    },
  ];
}

function usageRightsForDraft(draft: NewImportDraft) {
  if (draft.rightsStatus === "VERIFIED") {
    return "Source metadata reviewed for internal AssessmentOS demo use.";
  }

  return "Usage rights require review before repository approval.";
}
