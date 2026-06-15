import { describe, expect, it } from "vitest";

import {
  calculateTemplatePatternMarks,
  createMockImportPreview,
  summarizeTemplateReadiness,
} from "@/lib/templates/helpers";
import type { SchoolTemplateItem } from "@/lib/templates/types";

describe("template helpers", () => {
  it("calculates section pattern marks", () => {
    expect(calculateTemplatePatternMarks(makeTemplate())).toBe(50);
  });

  it("reports readiness issues for incomplete templates", () => {
    const summary = summarizeTemplateReadiness({
      ...makeTemplate(),
      headerText: "",
      defaultTotalMarks: 60,
    });

    expect(summary.isReady).toBe(false);
    expect(summary.issues).toEqual(
      expect.arrayContaining([
        "Header text is missing.",
        "Section pattern marks do not match the default total marks.",
      ]),
    );
  });

  it("creates a review-only mock import preview", () => {
    const preview = createMockImportPreview("old-paper.pdf");

    expect(preview.filename).toBe("old-paper.pdf");
    expect(preview.confidenceLabel).toBe("Mock preview");
    expect(preview.reviewMessage).toContain("OCR and AI extraction");
  });
});

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
    defaultDurationMinutes: 90,
    defaultTotalMarks: 50,
    sectionPattern: [
      { title: "Section A", instructions: "Short answers.", expectedMarks: 20 },
      { title: "Section B", instructions: "Long answers.", expectedMarks: 30 },
    ],
    pageRuleNotes: "A4 layout.",
    status: "ACTIVE",
    versionNumber: 1,
    updatedAt: "2026-06-15T00:00:00.000Z",
  };
}
