import { calculatePaperTotalMarks, validatePaper } from "@/lib/papers/helpers";
import type { PaperBuilderItem } from "@/lib/papers/types";
import { summarizeTemplateReadiness } from "@/lib/templates/helpers";
import type { SchoolTemplateItem } from "@/lib/templates/types";
import type {
  ExportReadinessItem,
  PaperExportPreview,
} from "@/lib/exports/types";

export function buildExportPreview({
  paper,
  template,
}: {
  paper: PaperBuilderItem;
  template: SchoolTemplateItem;
}): PaperExportPreview {
  const paperValidation = validatePaper(paper);
  const templateReadiness = summarizeTemplateReadiness(template);
  const totalMarks = calculatePaperTotalMarks(paper.sections);

  return {
    paper,
    template,
    totalMarks,
    validationIssues: paperValidation.issues,
    checklist: [
      {
        id: "paper-metadata",
        label: "Paper metadata",
        isReady: Boolean(paper.title && paper.gradeName && paper.subjectName),
        detail: "Title, grade, and subject are present.",
      },
      {
        id: "questions",
        label: "Questions",
        isReady: paper.sections.some((section) => section.questions.length > 0),
        detail: "At least one section contains repository questions.",
      },
      {
        id: "answer-keys",
        label: "Answer keys",
        isReady: countMissingAnswerKeys(paper) === 0,
        detail:
          countMissingAnswerKeys(paper) === 0
            ? "All included questions have answer keys."
            : `${countMissingAnswerKeys(paper)} questions are missing answer keys.`,
      },
      {
        id: "template",
        label: "School template",
        isReady: templateReadiness.isReady,
        detail: templateReadiness.isReady
          ? "Template fields and section marks are aligned."
          : templateReadiness.issues.join(" "),
      },
      {
        id: "validation",
        label: "Validation",
        isReady: paperValidation.issues.every(
          (issue) => issue.severity !== "ERROR",
        ),
        detail:
          paperValidation.issues.length === 0
            ? "No validation issues found."
            : `${paperValidation.issues.length} validation issues are visible for review.`,
      },
    ],
  };
}

export function isExportReady(checklist: ExportReadinessItem[]) {
  return checklist.every((item) => item.isReady);
}

export function countMissingAnswerKeys(paper: PaperBuilderItem) {
  return paper.sections.reduce(
    (total, section) =>
      total +
      section.questions.filter(
        (paperQuestion) => !paperQuestion.question.answerKey.isComplete,
      ).length,
    0,
  );
}
