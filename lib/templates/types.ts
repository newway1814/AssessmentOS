import type { TemplateStatus, TemplateType } from "@/lib/domain/constants";

export type StudentMetadataField =
  | "Name"
  | "Roll number"
  | "Class"
  | "Section"
  | "Date";

export type TemplateSectionPattern = {
  title: string;
  instructions: string;
  expectedMarks: number;
};

export type SchoolTemplateItem = {
  id: string;
  schoolId: string;
  workspaceId: string;
  name: string;
  type: TemplateType;
  schoolName: string;
  logoUrl?: string;
  headerText: string;
  footerText: string;
  examInstructions: string;
  studentMetadataFields: StudentMetadataField[];
  defaultDurationMinutes: number;
  defaultTotalMarks: number;
  sectionPattern: TemplateSectionPattern[];
  pageRuleNotes: string;
  status: TemplateStatus;
  versionNumber: number;
  updatedAt: string;
};

export type SchoolTemplateFormValues = Omit<
  SchoolTemplateItem,
  "id" | "schoolId" | "workspaceId" | "versionNumber" | "updatedAt"
>;

export type TemplateImportPreview = {
  filename: string;
  detectedName: string;
  detectedSections: TemplateSectionPattern[];
  confidenceLabel: "Mock preview";
  reviewMessage: string;
};

export type SchoolTemplateAdapter = {
  listTemplates(): Promise<SchoolTemplateItem[]>;
  getTemplate(id: string): Promise<SchoolTemplateItem | undefined>;
  createTemplate(input: SchoolTemplateFormValues): Promise<SchoolTemplateItem>;
  updateTemplate(
    id: string,
    input: SchoolTemplateFormValues,
  ): Promise<SchoolTemplateItem>;
  mockImportPreview(filename: string): Promise<TemplateImportPreview>;
};
