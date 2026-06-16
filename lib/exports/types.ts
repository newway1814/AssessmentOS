import type { ValidationIssue } from "@/lib/domain/validation";
import type { PaperBuilderItem } from "@/lib/papers/types";
import type { SchoolTemplateItem } from "@/lib/templates/types";

export type ExportFormat = "PDF" | "DOCX" | "PRINT";
export type ExportCopyMode = "STUDENT" | "TEACHER" | "ASSIGNMENT";
export type ExportPreviewMode = "ASSESSMENT" | "ASSIGNMENT";
export type ExportRequestStatus =
  | "DRAFT"
  | "READY"
  | "QUEUED"
  | "GENERATED_PLACEHOLDER"
  | "FAILED";

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

export type ExportRequestItem = {
  id: string;
  paperId: string;
  paperTitle: string;
  templateVersionId: string;
  templateName: string;
  format: ExportFormat;
  copyType: ExportCopyMode;
  status: ExportRequestStatus;
  answerKeyVisible: boolean;
  previewMode: ExportPreviewMode;
  checklist: ExportReadinessItem[];
  ready: boolean;
  blockerCount: number;
  updatedAt: string;
};

export type ExportRequestInput = {
  paperId: string;
  format: ExportFormat;
  copyType: ExportCopyMode;
  answerKeyVisible: boolean;
  previewMode: ExportPreviewMode;
};

export type ExportPreviewStateInput = {
  copyType: ExportCopyMode;
  answerKeyVisible: boolean;
  previewMode: ExportPreviewMode;
};

export type ExportStatusInput = {
  format: ExportFormat;
  status: "QUEUED" | "GENERATED_PLACEHOLDER" | "FAILED";
};

export type ExportPreviewState = {
  request?: ExportRequestItem;
  copyType: ExportCopyMode;
  answerKeyVisible: boolean;
  previewMode: ExportPreviewMode;
};

export type PersistedPaperExportPreview = PaperExportPreview & {
  state: ExportPreviewState;
};

export type ExportRepositoryAdapter = {
  listExportRequests(): Promise<ExportRequestItem[]>;
  listExportPreviews(): Promise<PersistedPaperExportPreview[]>;
  getExportPreview(
    paperId: string,
  ): Promise<PersistedPaperExportPreview | undefined>;
  createExportRequest(input: ExportRequestInput): Promise<ExportRequestItem>;
  updatePreviewState(
    paperId: string,
    input: ExportPreviewStateInput,
  ): Promise<PersistedPaperExportPreview>;
  updateExportStatus(
    paperId: string,
    input: ExportStatusInput,
  ): Promise<PersistedPaperExportPreview>;
};

export type ExportMutations = Pick<
  ExportRepositoryAdapter,
  "updatePreviewState" | "updateExportStatus"
>;
