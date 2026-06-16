import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

type JsonRecord = Record<string, unknown>;

export type RecordStatus = "ACTIVE" | "ARCHIVED";
export type RoleName =
  | "TEACHER"
  | "ACADEMIC_COORDINATOR"
  | "REVIEWER"
  | "SCHOOL_ADMIN";
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "SHORT_ANSWER"
  | "LONG_ANSWER"
  | "TRUE_FALSE"
  | "FILL_IN_THE_BLANK"
  | "MATCHING";
export type QuestionStatus = "DRAFT" | "READY" | "NEEDS_REVIEW" | "ARCHIVED";
export type SourceType =
  | "TEACHER_CREATED"
  | "SCHOOL_OWNED"
  | "LICENSED"
  | "OPEN"
  | "PUBLIC_DOMAIN"
  | "VERIFIED_PARTNER";
export type RightsStatus = "VERIFIED" | "NEEDS_REVIEW" | "RESTRICTED";
export type UploadStatus = "PENDING" | "STORED" | "PROCESSING" | "FAILED";
export type ImportSourceOption =
  | "PDF"
  | "IMAGE_SCAN"
  | "DOCX"
  | "PASTED_TEXT"
  | "SCHOOL_REPOSITORY_BATCH"
  | "VERIFIED_EXTERNAL_SOURCE";
export type ImportStatus =
  | "UPLOADED"
  | "NORMALIZING"
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "REJECTED";
export type ImportCandidateStatus =
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EDIT_LATER";
export type PaperStatus =
  | "DRAFT"
  | "VALIDATING"
  | "READY_FOR_REVIEW"
  | "ARCHIVED";
export type TemplateStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type TemplateType =
  | "EXAM"
  | "ASSIGNMENT"
  | "WORKSHEET"
  | "ANSWER_KEY"
  | "RUBRIC";
export type ValidationSeverity = "INFO" | "WARNING" | "ERROR";
export type ValidationTargetType =
  | "QUESTION"
  | "IMPORT_CANDIDATE"
  | "PAPER"
  | "TEMPLATE"
  | "UPLOAD"
  | "EXPORT";
export type ApprovalStatus =
  | "REQUESTED"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "CANCELLED";
export type ExportFormat = "PDF" | "DOCX" | "PRINT";
export type ExportStatus = "REQUESTED" | "READY" | "FAILED" | "PLACEHOLDER";
export type ExportCopyType = "STUDENT" | "TEACHER";

const id = () => text("id").primaryKey();
const createdAt = () =>
  text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);
const updatedAt = () =>
  text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);
const optionalJson = <T = JsonRecord>(name: string) =>
  text(name, { mode: "json" }).$type<T>();
const requiredJson = <T = JsonRecord>(name: string) =>
  text(name, { mode: "json" }).$type<T>().notNull();

export const schools = sqliteTable(
  "schools",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    status: text("status").$type<RecordStatus>().notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("schools_slug_unique").on(table.slug)],
);

export const campuses = sqliteTable(
  "campuses",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    status: text("status").$type<RecordStatus>().notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("campuses_school_idx").on(table.schoolId)],
);

export const workspaces = sqliteTable(
  "workspaces",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    campusId: text("campus_id").references(() => campuses.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    defaultLocale: text("default_locale").notNull().default("en"),
    status: text("status").$type<RecordStatus>().notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("workspaces_school_idx").on(table.schoolId),
    index("workspaces_campus_idx").on(table.campusId),
  ],
);

export const users = sqliteTable(
  "users",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    status: text("status").$type<RecordStatus>().notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const roles = sqliteTable(
  "roles",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    name: text("name").$type<RoleName>().notNull(),
    status: text("status").$type<RecordStatus>().notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("roles_assignment_unique").on(
      table.schoolId,
      table.workspaceId,
      table.userId,
      table.name,
    ),
    index("roles_user_idx").on(table.userId),
  ],
);

export const subjects = sqliteTable(
  "subjects",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    code: text("code"),
    status: text("status").$type<RecordStatus>().notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("subjects_workspace_name_unique").on(
      table.workspaceId,
      table.name,
    ),
    index("subjects_tenant_idx").on(table.schoolId, table.workspaceId),
  ],
);

export const grades = sqliteTable(
  "grades",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    order: integer("order").notNull(),
    status: text("status").$type<RecordStatus>().notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("grades_workspace_name_unique").on(
      table.workspaceId,
      table.name,
    ),
    index("grades_tenant_idx").on(table.schoolId, table.workspaceId),
  ],
);

export const chapters = sqliteTable(
  "chapters",
  {
    id: id(),
    schoolId: text("school_id").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    order: integer("order").notNull(),
    status: text("status").$type<RecordStatus>().notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("chapters_subject_name_unique").on(table.subjectId, table.name),
    index("chapters_tenant_idx").on(table.schoolId, table.workspaceId),
  ],
);

export const subtopics = sqliteTable(
  "subtopics",
  {
    id: id(),
    schoolId: text("school_id").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapters.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    order: integer("order").notNull(),
    status: text("status").$type<RecordStatus>().notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("subtopics_chapter_name_unique").on(
      table.chapterId,
      table.name,
    ),
    index("subtopics_tenant_idx").on(table.schoolId, table.workspaceId),
  ],
);

export const uploads = sqliteTable(
  "uploads",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    uploadedById: text("uploaded_by_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    storageKey: text("storage_key").notNull(),
    sourceType: text("source_type").$type<SourceType>().notNull(),
    rightsStatus: text("rights_status")
      .$type<RightsStatus>()
      .notNull()
      .default("NEEDS_REVIEW"),
    usageRights: text("usage_rights").notNull(),
    processingStatus: text("processing_status")
      .$type<UploadStatus>()
      .notNull()
      .default("PENDING"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("uploads_tenant_idx").on(table.schoolId, table.workspaceId),
  ],
);

export const questionSources = sqliteTable(
  "question_sources",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    uploadId: text("upload_id").references(() => uploads.id, {
      onDelete: "set null",
    }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    sourceType: text("source_type").$type<SourceType>().notNull(),
    title: text("title").notNull(),
    author: text("author"),
    owner: text("owner"),
    license: text("license"),
    rightsStatus: text("rights_status")
      .$type<RightsStatus>()
      .notNull()
      .default("NEEDS_REVIEW"),
    usageRights: text("usage_rights").notNull(),
    attributionText: text("attribution_text"),
    originalUrl: text("original_url"),
    verifiedAt: text("verified_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("question_sources_tenant_idx").on(table.schoolId, table.workspaceId),
    index("question_sources_upload_idx").on(table.uploadId),
  ],
);

export const questions = sqliteTable(
  "questions",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    sourceId: text("source_id")
      .notNull()
      .references(() => questionSources.id, {
        onDelete: "restrict",
      }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, {
        onDelete: "restrict",
      }),
    gradeId: text("grade_id")
      .notNull()
      .references(() => grades.id, {
        onDelete: "restrict",
      }),
    chapterId: text("chapter_id").references(() => chapters.id, {
      onDelete: "set null",
    }),
    subtopicId: text("subtopic_id").references(() => subtopics.id, {
      onDelete: "set null",
    }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    type: text("type").$type<QuestionType>().notNull(),
    prompt: text("prompt").notNull(),
    marks: integer("marks").notNull(),
    difficulty: text("difficulty"),
    status: text("status").$type<QuestionStatus>().notNull().default("DRAFT"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("questions_tenant_idx").on(table.schoolId, table.workspaceId),
    index("questions_subject_grade_idx").on(table.subjectId, table.gradeId),
    index("questions_rights_source_idx").on(table.sourceId),
  ],
);

export const questionVersions = sqliteTable(
  "question_versions",
  {
    id: id(),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, {
        onDelete: "cascade",
      }),
    editedById: text("edited_by_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    versionNumber: integer("version_number").notNull(),
    promptSnapshot: text("prompt_snapshot").notNull(),
    metadataSnapshot: requiredJson("metadata_snapshot"),
    sourceSnapshot: requiredJson("source_snapshot"),
    answerKeySnapshot: optionalJson("answer_key_snapshot"),
    changeReason: text("change_reason"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("question_versions_number_unique").on(
      table.questionId,
      table.versionNumber,
    ),
  ],
);

export const importBatches = sqliteTable(
  "import_batches",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    uploadId: text("upload_id").references(() => uploads.id, {
      onDelete: "set null",
    }),
    submittedById: text("submitted_by_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    title: text("title").notNull(),
    sourceOption: text("source_option").$type<ImportSourceOption>().notNull(),
    status: text("status").$type<ImportStatus>().notNull().default("UPLOADED"),
    rawText: text("raw_text"),
    normalizationMetadata: optionalJson("normalization_metadata"),
    rightsAcknowledgedAt: text("rights_acknowledged_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("import_batches_tenant_idx").on(table.schoolId, table.workspaceId),
    index("import_batches_upload_idx").on(table.uploadId),
  ],
);

export const importCandidates = sqliteTable(
  "import_candidates",
  {
    id: id(),
    importBatchId: text("import_batch_id")
      .notNull()
      .references(() => importBatches.id, { onDelete: "cascade" }),
    approvedQuestionId: text("approved_question_id").references(
      () => questions.id,
      {
        onDelete: "set null",
      },
    ),
    reviewedById: text("reviewed_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    prompt: text("prompt").notNull(),
    subjectName: text("subject_name").notNull(),
    gradeName: text("grade_name").notNull(),
    chapterName: text("chapter_name"),
    subtopicName: text("subtopic_name"),
    type: text("type").$type<QuestionType>().notNull(),
    marks: integer("marks").notNull(),
    difficulty: text("difficulty"),
    answerKeyDraft: text("answer_key_draft"),
    sourceType: text("source_type").$type<SourceType>().notNull(),
    rightsStatus: text("rights_status")
      .$type<RightsStatus>()
      .notNull()
      .default("NEEDS_REVIEW"),
    sourceTitle: text("source_title").notNull(),
    sourceReference: text("source_reference").notNull(),
    usageRights: text("usage_rights").notNull(),
    confidence: real("confidence"),
    reviewStatus: text("review_status")
      .$type<ImportCandidateStatus>()
      .notNull()
      .default("NEEDS_REVIEW"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("import_candidates_batch_idx").on(table.importBatchId),
    index("import_candidates_question_idx").on(table.approvedQuestionId),
  ],
);

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    uploadId: text("upload_id").references(() => uploads.id, {
      onDelete: "set null",
    }),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    storageKey: text("storage_key").notNull(),
    sourceType: text("source_type").$type<SourceType>(),
    rightsStatus: text("rights_status").$type<RightsStatus>(),
    usageRights: text("usage_rights"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("media_assets_tenant_idx").on(table.schoolId, table.workspaceId),
  ],
);

export const templates = sqliteTable(
  "templates",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    name: text("name").notNull(),
    type: text("type").$type<TemplateType>().notNull(),
    status: text("status").$type<TemplateStatus>().notNull().default("DRAFT"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("templates_tenant_idx").on(table.schoolId, table.workspaceId),
  ],
);

export const templateVersions = sqliteTable(
  "template_versions",
  {
    id: id(),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, {
        onDelete: "cascade",
      }),
    versionNumber: integer("version_number").notNull(),
    structure: requiredJson("structure"),
    changeReason: text("change_reason"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("template_versions_number_unique").on(
      table.templateId,
      table.versionNumber,
    ),
  ],
);

export const papers = sqliteTable(
  "papers",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, {
        onDelete: "restrict",
      }),
    gradeId: text("grade_id")
      .notNull()
      .references(() => grades.id, {
        onDelete: "restrict",
      }),
    templateVersionId: text("template_version_id").references(
      () => templateVersions.id,
      { onDelete: "set null" },
    ),
    createdById: text("created_by_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    title: text("title").notNull(),
    durationMinutes: integer("duration_minutes"),
    totalMarksTarget: integer("total_marks_target"),
    status: text("status").$type<PaperStatus>().notNull().default("DRAFT"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("papers_tenant_idx").on(table.schoolId, table.workspaceId)],
);

export const paperSections = sqliteTable(
  "paper_sections",
  {
    id: id(),
    paperId: text("paper_id")
      .notNull()
      .references(() => papers.id, {
        onDelete: "cascade",
      }),
    title: text("title").notNull(),
    instructions: text("instructions"),
    order: integer("order").notNull(),
    marks: integer("marks"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("paper_sections_order_unique").on(table.paperId, table.order),
  ],
);

export const paperQuestions = sqliteTable(
  "paper_questions",
  {
    id: id(),
    paperSectionId: text("paper_section_id")
      .notNull()
      .references(() => paperSections.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, {
        onDelete: "restrict",
      }),
    questionVersionId: text("question_version_id")
      .notNull()
      .references(() => questionVersions.id, { onDelete: "restrict" }),
    order: integer("order").notNull(),
    marksOverride: integer("marks_override"),
    promptOverride: text("prompt_override"),
    displaySettings: optionalJson("display_settings"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("paper_questions_order_unique").on(
      table.paperSectionId,
      table.order,
    ),
    index("paper_questions_question_idx").on(table.questionId),
    index("paper_questions_version_idx").on(table.questionVersionId),
  ],
);

export const rubrics = sqliteTable(
  "rubrics",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    paperId: text("paper_id").references(() => papers.id, {
      onDelete: "cascade",
    }),
    questionId: text("question_id").references(() => questions.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    criteria: requiredJson("criteria"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("rubrics_tenant_idx").on(table.schoolId, table.workspaceId),
  ],
);

export const answerKeys = sqliteTable(
  "answer_keys",
  {
    id: id(),
    questionId: text("question_id").references(() => questions.id, {
      onDelete: "cascade",
    }),
    questionVersionId: text("question_version_id").references(
      () => questionVersions.id,
      { onDelete: "set null" },
    ),
    paperId: text("paper_id").references(() => papers.id, {
      onDelete: "cascade",
    }),
    content: requiredJson("content"),
    isComplete: integer("is_complete", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("answer_keys_question_version_unique").on(
      table.questionVersionId,
    ),
    uniqueIndex("answer_keys_paper_unique").on(table.paperId),
    index("answer_keys_question_idx").on(table.questionId),
  ],
);

export const validationResults = sqliteTable(
  "validation_results",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    targetType: text("target_type").$type<ValidationTargetType>().notNull(),
    targetId: text("target_id").notNull(),
    targetVersionId: text("target_version_id"),
    severity: text("severity").$type<ValidationSeverity>().notNull(),
    code: text("code").notNull(),
    message: text("message").notNull(),
    field: text("field"),
    suggestedFix: text("suggested_fix"),
    resolvedAt: text("resolved_at"),
    createdAt: createdAt(),
  },
  (table) => [
    index("validation_results_tenant_idx").on(
      table.schoolId,
      table.workspaceId,
    ),
    index("validation_results_target_idx").on(table.targetType, table.targetId),
  ],
);

export const approvalRequests = sqliteTable(
  "approval_requests",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    requestedById: text("requested_by_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    decidedById: text("decided_by_id").references(() => users.id, {
      onDelete: "restrict",
    }),
    targetType: text("target_type").$type<ValidationTargetType>().notNull(),
    targetId: text("target_id").notNull(),
    status: text("status")
      .$type<ApprovalStatus>()
      .notNull()
      .default("REQUESTED"),
    requestedAt: text("requested_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    decidedAt: text("decided_at"),
  },
  (table) => [
    index("approval_requests_tenant_idx").on(table.schoolId, table.workspaceId),
    index("approval_requests_target_idx").on(table.targetType, table.targetId),
  ],
);

export const comments = sqliteTable(
  "comments",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    approvalRequestId: text("approval_request_id").references(
      () => approvalRequests.id,
      { onDelete: "cascade" },
    ),
    targetType: text("target_type").$type<ValidationTargetType>().notNull(),
    targetId: text("target_id").notNull(),
    body: text("body").notNull(),
    resolvedAt: text("resolved_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("comments_tenant_idx").on(table.schoolId, table.workspaceId),
    index("comments_target_idx").on(table.targetType, table.targetId),
  ],
);

export const exportRequests = sqliteTable(
  "export_requests",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    paperId: text("paper_id")
      .notNull()
      .references(() => papers.id, {
        onDelete: "cascade",
      }),
    templateVersionId: text("template_version_id")
      .notNull()
      .references(() => templateVersions.id, { onDelete: "restrict" }),
    requestedById: text("requested_by_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    format: text("format").$type<ExportFormat>().notNull(),
    copyType: text("copy_type").$type<ExportCopyType>().notNull(),
    status: text("status")
      .$type<ExportStatus>()
      .notNull()
      .default("PLACEHOLDER"),
    readinessSummary: requiredJson("readiness_summary"),
    storageKey: text("storage_key"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("export_requests_tenant_idx").on(table.schoolId, table.workspaceId),
    index("export_requests_paper_idx").on(table.paperId),
  ],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, {
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id").references(() => workspaces.id, {
      onDelete: "set null",
    }),
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    metadata: optionalJson("metadata"),
    createdAt: createdAt(),
  },
  (table) => [
    index("audit_logs_tenant_idx").on(table.schoolId, table.workspaceId),
    index("audit_logs_target_idx").on(table.targetType, table.targetId),
  ],
);

export type School = typeof schools.$inferSelect;
export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type QuestionVersion = typeof questionVersions.$inferSelect;
export type ImportBatch = typeof importBatches.$inferSelect;
export type ImportCandidate = typeof importCandidates.$inferSelect;
export type Paper = typeof papers.$inferSelect;
export type Template = typeof templates.$inferSelect;
