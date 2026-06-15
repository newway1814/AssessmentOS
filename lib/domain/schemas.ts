import { z } from "zod";

import {
  paperStatuses,
  questionTypes,
  rightsStatuses,
  sourceTypes,
  templateStatuses,
  templateTypes,
  validationSeverities,
  validationTargetTypes,
} from "@/lib/domain/constants";

const idSchema = z.string().min(1);
const marksSchema = z.number().int().min(0).max(500);

export const questionSourceInputSchema = z.object({
  sourceType: z.enum(sourceTypes),
  title: z.string().min(1).max(200),
  author: z.string().max(200).optional(),
  owner: z.string().max(200).optional(),
  license: z.string().max(200).optional(),
  rightsStatus: z.enum(rightsStatuses),
  usageRights: z.string().min(1).max(1000),
  attributionText: z.string().max(1000).optional(),
  originalUrl: z.string().url().optional(),
});

export const questionInputSchema = z.object({
  schoolId: idSchema,
  workspaceId: idSchema,
  sourceId: idSchema,
  subjectId: idSchema,
  gradeId: idSchema,
  chapterId: idSchema.optional(),
  subtopicId: idSchema.optional(),
  type: z.enum(questionTypes),
  prompt: z.string().min(1).max(10000),
  marks: marksSchema,
  difficulty: z.string().max(100).optional(),
});

export const paperSectionInputSchema = z.object({
  title: z.string().min(1).max(200),
  instructions: z.string().max(2000).optional(),
  order: z.number().int().min(1),
  marks: marksSchema.optional(),
});

export const paperQuestionInputSchema = z.object({
  questionId: idSchema,
  questionVersionId: idSchema.optional(),
  order: z.number().int().min(1),
  marksOverride: marksSchema.optional(),
});

export const paperInputSchema = z.object({
  schoolId: idSchema,
  workspaceId: idSchema,
  subjectId: idSchema,
  gradeId: idSchema,
  templateVersionId: idSchema.optional(),
  title: z.string().min(1).max(200),
  status: z.enum(paperStatuses).default("DRAFT"),
  sections: z.array(paperSectionInputSchema).min(1),
});

export const templateInputSchema = z.object({
  schoolId: idSchema,
  workspaceId: idSchema.optional(),
  name: z.string().min(1).max(200),
  type: z.enum(templateTypes),
  status: z.enum(templateStatuses).default("DRAFT"),
});

export const validationResultInputSchema = z.object({
  schoolId: idSchema,
  workspaceId: idSchema,
  targetType: z.enum(validationTargetTypes),
  targetId: idSchema,
  severity: z.enum(validationSeverities),
  code: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
  field: z.string().max(200).optional(),
  suggestedFix: z.string().max(1000).optional(),
});

export type QuestionSourceInput = z.infer<typeof questionSourceInputSchema>;
export type QuestionInput = z.infer<typeof questionInputSchema>;
export type PaperSectionInput = z.infer<typeof paperSectionInputSchema>;
export type PaperQuestionInput = z.infer<typeof paperQuestionInputSchema>;
export type PaperInput = z.infer<typeof paperInputSchema>;
export type TemplateInput = z.infer<typeof templateInputSchema>;
export type ValidationResultInput = z.infer<typeof validationResultInputSchema>;
