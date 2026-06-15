import {
  detectDuplicateQuestions,
  detectMissingAnswerKeys,
  validateSectionMarks,
  validateTotalMarks,
  type PaperSectionForValidation,
} from "@/lib/domain/validation";
import type {
  PaperBuilderItem,
  PaperQuestionItem,
  PaperSectionItem,
  PaperValidationSummary,
} from "@/lib/papers/types";

export function calculateSectionMarks(section: PaperSectionItem) {
  return section.questions.reduce(
    (total, paperQuestion) => total + paperQuestion.marks,
    0,
  );
}

export function calculatePaperTotalMarks(sections: PaperSectionItem[]) {
  return sections.reduce(
    (total, section) => total + calculateSectionMarks(section),
    0,
  );
}

export function addQuestionToSection({
  section,
  question,
}: {
  section: PaperSectionItem;
  question: PaperQuestionItem["question"];
}): PaperSectionItem {
  const nextOrder =
    Math.max(
      0,
      ...section.questions.map((paperQuestion) => paperQuestion.order),
    ) + 1;

  return {
    ...section,
    questions: [
      ...section.questions,
      {
        id: `paper-question-${question.id}-${Date.now()}`,
        question,
        order: nextOrder,
        marks: question.marks,
      },
    ],
  };
}

export function removeQuestionFromSection({
  section,
  paperQuestionId,
}: {
  section: PaperSectionItem;
  paperQuestionId: string;
}): PaperSectionItem {
  return {
    ...section,
    questions: section.questions
      .filter((paperQuestion) => paperQuestion.id !== paperQuestionId)
      .map((paperQuestion, index) => ({ ...paperQuestion, order: index + 1 })),
  };
}

export function moveQuestionInSection({
  section,
  paperQuestionId,
  direction,
}: {
  section: PaperSectionItem;
  paperQuestionId: string;
  direction: "up" | "down";
}): PaperSectionItem {
  const questions = [...section.questions].sort((a, b) => a.order - b.order);
  const currentIndex = questions.findIndex(
    (paperQuestion) => paperQuestion.id === paperQuestionId,
  );
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= questions.length) {
    return section;
  }

  const currentQuestion = questions[currentIndex];
  const targetQuestion = questions[targetIndex];

  if (!currentQuestion || !targetQuestion) {
    return section;
  }

  questions[currentIndex] = targetQuestion;
  questions[targetIndex] = currentQuestion;

  return {
    ...section,
    questions: questions.map((paperQuestion, index) => ({
      ...paperQuestion,
      order: index + 1,
    })),
  };
}

export function validatePaper(paper: PaperBuilderItem): PaperValidationSummary {
  const sectionsForValidation = toValidationSections(paper.sections);
  const expectedTotal = paper.sections.reduce(
    (total, section) => total + (section.expectedMarks ?? 0),
    0,
  );
  const totalMarks = calculatePaperTotalMarks(paper.sections);
  const sectionMarks = paper.sections.map((section) => ({
    sectionId: section.id,
    title: section.title,
    marks: calculateSectionMarks(section),
    expectedMarks: section.expectedMarks,
  }));

  const issues = [
    ...validateSectionMarks(sectionsForValidation),
    ...detectDuplicateQuestions(sectionsForValidation),
    ...detectMissingAnswerKeys(sectionsForValidation),
    ...(expectedTotal > 0
      ? validateTotalMarks({ expectedTotal, sections: sectionsForValidation })
      : []),
    ...paper.sections
      .filter((section) => section.questions.length === 0)
      .map((section) => ({
        code: "EMPTY_SECTION",
        severity: "WARNING" as const,
        message: `${section.title} does not contain any questions yet.`,
      })),
  ];

  return {
    totalMarks,
    sectionMarks,
    issues,
  };
}

function toValidationSections(
  sections: PaperSectionItem[],
): PaperSectionForValidation[] {
  return sections.map((section) => ({
    id: section.id,
    title: section.title,
    expectedMarks: section.expectedMarks,
    questions: section.questions.map((paperQuestion) => ({
      questionId: paperQuestion.question.id,
      marks: paperQuestion.marks,
      hasAnswerKey: paperQuestion.question.answerKey.isComplete,
    })),
  }));
}
