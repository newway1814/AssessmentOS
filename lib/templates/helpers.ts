import type {
  SchoolTemplateItem,
  TemplateImportPreview,
} from "@/lib/templates/types";

export function calculateTemplatePatternMarks(template: SchoolTemplateItem) {
  return template.sectionPattern.reduce(
    (total, section) => total + section.expectedMarks,
    0,
  );
}

export function summarizeTemplateReadiness(template: SchoolTemplateItem) {
  const issues: string[] = [];

  if (!template.headerText.trim()) {
    issues.push("Header text is missing.");
  }

  if (!template.examInstructions.trim()) {
    issues.push("Exam instructions are missing.");
  }

  if (template.studentMetadataFields.length === 0) {
    issues.push("Student metadata fields are not configured.");
  }

  if (calculateTemplatePatternMarks(template) !== template.defaultTotalMarks) {
    issues.push("Section pattern marks do not match the default total marks.");
  }

  return {
    isReady: issues.length === 0,
    issues,
  };
}

export function createMockImportPreview(
  filename: string,
): TemplateImportPreview {
  return {
    filename,
    detectedName: "Detected Midterm Exam Template",
    confidenceLabel: "Mock preview",
    reviewMessage:
      "Review the detected structure before saving. OCR and AI extraction are intentionally not enabled yet.",
    detectedSections: [
      {
        title: "Section A",
        instructions: "Answer all questions.",
        expectedMarks: 20,
      },
      {
        title: "Section B",
        instructions: "Show working for long-answer questions.",
        expectedMarks: 30,
      },
    ],
  };
}
