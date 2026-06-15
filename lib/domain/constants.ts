export const roleNames = [
  "TEACHER",
  "ACADEMIC_COORDINATOR",
  "REVIEWER",
  "SCHOOL_ADMIN",
] as const;

export const questionTypes = [
  "MULTIPLE_CHOICE",
  "SHORT_ANSWER",
  "LONG_ANSWER",
  "TRUE_FALSE",
  "FILL_IN_THE_BLANK",
  "MATCHING",
] as const;

export const sourceTypes = [
  "TEACHER_CREATED",
  "SCHOOL_OWNED",
  "LICENSED",
  "OPEN",
  "PUBLIC_DOMAIN",
  "VERIFIED_PARTNER",
] as const;

export const rightsStatuses = [
  "VERIFIED",
  "NEEDS_REVIEW",
  "RESTRICTED",
] as const;

export const validationSeverities = ["INFO", "WARNING", "ERROR"] as const;

export const validationTargetTypes = [
  "QUESTION",
  "PAPER",
  "TEMPLATE",
  "UPLOAD",
  "EXPORT",
] as const;

export const paperStatuses = [
  "DRAFT",
  "VALIDATING",
  "READY_FOR_REVIEW",
  "ARCHIVED",
] as const;

export const templateStatuses = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export const templateTypes = [
  "EXAM",
  "ASSIGNMENT",
  "WORKSHEET",
  "ANSWER_KEY",
  "RUBRIC",
] as const;

export type RoleName = (typeof roleNames)[number];
export type QuestionType = (typeof questionTypes)[number];
export type SourceType = (typeof sourceTypes)[number];
export type RightsStatus = (typeof rightsStatuses)[number];
export type ValidationSeverity = (typeof validationSeverities)[number];
export type ValidationTargetType = (typeof validationTargetTypes)[number];
export type PaperStatus = (typeof paperStatuses)[number];
export type TemplateStatus = (typeof templateStatuses)[number];
export type TemplateType = (typeof templateTypes)[number];
