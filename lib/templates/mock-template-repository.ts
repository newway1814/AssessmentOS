import { createMockImportPreview } from "@/lib/templates/helpers";
import type {
  SchoolTemplateAdapter,
  SchoolTemplateItem,
} from "@/lib/templates/types";

const demoSchoolId = "school-riverside";
const demoWorkspaceId = "workspace-academic-coordination";

let templates: SchoolTemplateItem[] = [
  {
    id: "template-riverside-standard-exam",
    schoolId: demoSchoolId,
    workspaceId: demoWorkspaceId,
    name: "Riverside Standard Exam Paper",
    type: "EXAM",
    schoolName: "Riverside International School",
    logoUrl: "",
    headerText: "End of Term Assessment",
    footerText:
      "This paper is confidential and intended for internal school use.",
    examInstructions:
      "Write all answers in the spaces provided. Show working for calculation questions.",
    studentMetadataFields: ["Name", "Roll number", "Class", "Section", "Date"],
    defaultDurationMinutes: 90,
    defaultTotalMarks: 50,
    sectionPattern: [
      {
        title: "Section A",
        instructions: "Answer all short-answer questions.",
        expectedMarks: 20,
      },
      {
        title: "Section B",
        instructions: "Answer any three long-answer questions.",
        expectedMarks: 30,
      },
    ],
    pageRuleNotes:
      "A4 layout, school header on first page, page numbers in footer, answer spaces kept with questions.",
    status: "ACTIVE",
    versionNumber: 1,
    updatedAt: "2026-06-15T11:00:00.000Z",
  },
  {
    id: "template-weekly-worksheet",
    schoolId: demoSchoolId,
    workspaceId: demoWorkspaceId,
    name: "Weekly Practice Worksheet",
    type: "WORKSHEET",
    schoolName: "Riverside International School",
    headerText: "Weekly Practice",
    footerText: "Prepared by the Academic Coordination Office.",
    examInstructions:
      "Complete independently unless your teacher states otherwise.",
    studentMetadataFields: ["Name", "Class", "Date"],
    defaultDurationMinutes: 30,
    defaultTotalMarks: 20,
    sectionPattern: [
      {
        title: "Practice",
        instructions: "Attempt all questions.",
        expectedMarks: 20,
      },
    ],
    pageRuleNotes: "Compact worksheet layout with room for teacher comments.",
    status: "DRAFT",
    versionNumber: 2,
    updatedAt: "2026-06-14T15:30:00.000Z",
  },
];

export const mockTemplateRepository: SchoolTemplateAdapter = {
  async listTemplates() {
    return [...templates];
  },

  async getTemplate(id) {
    return templates.find((template) => template.id === id);
  },

  async createTemplate(input) {
    const nextTemplate: SchoolTemplateItem = {
      id: `template-${Date.now()}`,
      schoolId: demoSchoolId,
      workspaceId: demoWorkspaceId,
      ...input,
      versionNumber: 1,
      updatedAt: new Date().toISOString(),
    };

    templates = [nextTemplate, ...templates];
    return nextTemplate;
  },

  async updateTemplate(id, input) {
    let updatedTemplate: SchoolTemplateItem | undefined;

    templates = templates.map((template) => {
      if (template.id !== id) {
        return template;
      }

      updatedTemplate = {
        ...template,
        ...input,
        versionNumber: template.versionNumber + 1,
        updatedAt: new Date().toISOString(),
      };

      return updatedTemplate;
    });

    if (!updatedTemplate) {
      throw new Error(`Template ${id} was not found.`);
    }

    return updatedTemplate;
  },

  async mockImportPreview(filename) {
    return createMockImportPreview(filename);
  },
};
