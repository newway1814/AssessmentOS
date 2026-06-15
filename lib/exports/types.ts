import type { ValidationIssue } from "@/lib/domain/validation";
import type { PaperBuilderItem } from "@/lib/papers/types";
import type { SchoolTemplateItem } from "@/lib/templates/types";

export type ExportCopyMode = "STUDENT" | "TEACHER";
export type ExportPreviewMode = "ASSESSMENT" | "ASSIGNMENT";

export type ExportReadinessItem = {
  id: string;
  label: string;
  isReady: boolean;
  detail: string;
};

export type PaperExportPreview = {
  paper: PaperBuilderItem;
  template: SchoolTemplateItem;
  totalMarks: number;
  validationIssues: ValidationIssue[];
  checklist: ExportReadinessItem[];
};
