import { randomUUID } from "node:crypto";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { auditLogs, templates, templateVersions } from "@/db/schema";
import { db as defaultDb, type DatabaseClient } from "@/lib/db/client";
import { demoTenantContext, type DemoTenantContext } from "@/lib/demo-tenant";
import { templateStatuses, templateTypes } from "@/lib/domain/constants";
import { templateInputSchema } from "@/lib/domain/schemas";
import { createMockImportPreview } from "@/lib/templates/helpers";
import type {
  SchoolTemplateAdapter,
  SchoolTemplateFormValues,
  SchoolTemplateItem,
  StudentMetadataField,
} from "@/lib/templates/types";

const studentMetadataFields = [
  "Name",
  "Roll number",
  "Class",
  "Section",
  "Date",
] as const;

const studentMetadataFieldSchema = z.enum(studentMetadataFields);

const templateSectionPatternSchema = z.object({
  title: z.string().min(1).max(200),
  instructions: z.string().max(1000),
  expectedMarks: z.number().int().min(0).max(500),
});

const templateStructureBoundarySchema = z.object({
  schoolName: z.string().min(1).max(200),
  logoUrl: z.string().url().or(z.literal("")).optional(),
  headerText: z.string().min(1).max(200),
  footerText: z.string().max(500),
  examInstructions: z.string().min(1).max(2000),
  studentMetadataFields: z.array(studentMetadataFieldSchema).min(1),
  defaultDurationMinutes: z.number().int().min(1).max(600),
  defaultTotalMarks: z.number().int().min(0).max(500),
  sectionPattern: z.array(templateSectionPatternSchema).min(1),
  pageRuleNotes: z.string().max(2000),
});

const templateFormBoundarySchema = templateStructureBoundarySchema.extend({
  name: z.string().min(1).max(200),
  type: z.enum(templateTypes),
  status: z.enum(templateStatuses),
});

type TemplateRow = typeof templates.$inferSelect;
type TemplateVersionRow = typeof templateVersions.$inferSelect;

export function createDrizzleTemplateRepository(
  database: DatabaseClient = defaultDb,
  tenant: DemoTenantContext = demoTenantContext,
): SchoolTemplateAdapter {
  return {
    async listTemplates() {
      const rows = await database
        .select()
        .from(templates)
        .where(
          and(
            eq(templates.schoolId, tenant.schoolId),
            eq(templates.workspaceId, tenant.workspaceId),
          ),
        )
        .orderBy(desc(templates.updatedAt));

      return Promise.all(
        rows.map((template) => mapTemplate(database, template)),
      );
    },

    async getTemplate(id) {
      const template = await findTenantTemplate(database, tenant, id);
      return template ? mapTemplate(database, template) : undefined;
    },

    async createTemplate(input) {
      const parsed = parseTemplateForm(input, tenant);
      const now = new Date().toISOString();
      const templateId = newId("template");
      const templateVersionId = newId("template-version");

      await database.insert(templates).values({
        id: templateId,
        schoolId: tenant.schoolId,
        workspaceId: tenant.workspaceId,
        createdById: tenant.actorId,
        name: parsed.name,
        type: parsed.type,
        status: parsed.status,
        updatedAt: now,
      });

      await insertTemplateVersion(database, {
        templateId,
        templateVersionId,
        versionNumber: 1,
        input: parsed,
        changeReason: "Initial template repository version.",
      });

      await writeAuditLog(database, tenant, {
        action: "template.created",
        targetId: templateId,
        metadata: { versionNumber: 1 },
      });

      return getTemplateOrThrow(database, tenant, templateId);
    },

    async updateTemplate(id, input) {
      const existing = await findTenantTemplate(database, tenant, id);

      if (!existing) {
        throw new Error(`Template ${id} was not found.`);
      }

      const parsed = parseTemplateForm(input, tenant);
      const now = new Date().toISOString();
      const nextVersionNumber =
        ((await getLatestVersion(database, existing.id))?.versionNumber ?? 0) +
        1;

      await database
        .update(templates)
        .set({
          name: parsed.name,
          type: parsed.type,
          status: parsed.status,
          updatedAt: now,
        })
        .where(eq(templates.id, existing.id));

      await insertTemplateVersion(database, {
        templateId: existing.id,
        templateVersionId: newId("template-version"),
        versionNumber: nextVersionNumber,
        input: parsed,
        changeReason: "Template repository edit.",
      });

      await writeAuditLog(database, tenant, {
        action: "template.updated",
        targetId: existing.id,
        metadata: { versionNumber: nextVersionNumber },
      });

      return getTemplateOrThrow(database, tenant, existing.id);
    },

    async archiveTemplate(id) {
      const existing = await findTenantTemplate(database, tenant, id);

      if (!existing) {
        throw new Error(`Template ${id} was not found.`);
      }

      await database
        .update(templates)
        .set({ status: "ARCHIVED", updatedAt: new Date().toISOString() })
        .where(eq(templates.id, existing.id));

      await writeAuditLog(database, tenant, {
        action: "template.archived",
        targetId: existing.id,
        metadata: { previousStatus: existing.status },
      });

      return getTemplateOrThrow(database, tenant, existing.id);
    },

    async mockImportPreview(filename) {
      return createMockImportPreview(filename);
    },
  };
}

export const drizzleTemplateRepository = createDrizzleTemplateRepository();

async function findTenantTemplate(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  templateId: string,
) {
  const [template] = await database
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, templateId),
        eq(templates.schoolId, tenant.schoolId),
        eq(templates.workspaceId, tenant.workspaceId),
      ),
    )
    .limit(1);

  return template;
}

async function getTemplateOrThrow(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  templateId: string,
) {
  const template = await findTenantTemplate(database, tenant, templateId);

  if (!template) {
    throw new Error(`Template ${templateId} was not found.`);
  }

  return mapTemplate(database, template);
}

async function mapTemplate(
  database: DatabaseClient,
  template: TemplateRow,
): Promise<SchoolTemplateItem> {
  const latestVersion = await getLatestVersion(database, template.id);
  const structure = parseTemplateStructure(latestVersion?.structure);

  return {
    id: template.id,
    schoolId: template.schoolId,
    workspaceId: template.workspaceId ?? demoTenantContext.workspaceId,
    name: template.name,
    type: template.type,
    schoolName: structure.schoolName,
    logoUrl: structure.logoUrl,
    headerText: structure.headerText,
    footerText: structure.footerText,
    examInstructions: structure.examInstructions,
    studentMetadataFields: structure.studentMetadataFields,
    defaultDurationMinutes: structure.defaultDurationMinutes,
    defaultTotalMarks: structure.defaultTotalMarks,
    sectionPattern: structure.sectionPattern,
    pageRuleNotes: structure.pageRuleNotes,
    status: template.status,
    versionNumber: latestVersion?.versionNumber ?? 1,
    updatedAt: normalizeTimestamp(template.updatedAt),
  };
}

async function getLatestVersion(database: DatabaseClient, templateId: string) {
  const [latestVersion] = await database
    .select()
    .from(templateVersions)
    .where(eq(templateVersions.templateId, templateId))
    .orderBy(desc(templateVersions.versionNumber))
    .limit(1);

  return latestVersion;
}

function parseTemplateForm(
  input: SchoolTemplateFormValues,
  tenant: DemoTenantContext,
) {
  const parsed = templateFormBoundarySchema.parse(input);

  templateInputSchema.parse({
    schoolId: tenant.schoolId,
    workspaceId: tenant.workspaceId,
    name: parsed.name,
    type: parsed.type,
    status: parsed.status,
  });

  return parsed;
}

function parseTemplateStructure(rawStructure: TemplateVersionRow["structure"]) {
  const record = isRecord(rawStructure) ? rawStructure : {};
  const defaultTotalMarks = toNumber(record.defaultTotalMarks, 40);

  return {
    schoolName: toStringValue(
      record.schoolName,
      "Riverside International School",
    ),
    logoUrl: toStringValue(record.logoUrl, ""),
    headerText: toStringValue(record.headerText, "Assessment"),
    footerText: toStringValue(
      record.footerText,
      "Prepared for internal school use.",
    ),
    examInstructions: toStringValue(
      record.examInstructions,
      "Answer all questions. Show working where appropriate.",
    ),
    studentMetadataFields: normalizeStudentMetadataFields(
      record.studentMetadataFields,
    ),
    defaultDurationMinutes: toNumber(record.defaultDurationMinutes, 60),
    defaultTotalMarks,
    sectionPattern: normalizeSectionPattern(
      record.sectionPattern,
      defaultTotalMarks,
    ),
    pageRuleNotes: toStringValue(
      record.pageRuleNotes,
      "A4 layout with school header on first page and page numbers in footer.",
    ),
  };
}

function normalizeStudentMetadataFields(
  value: unknown,
): StudentMetadataField[] {
  if (!Array.isArray(value)) {
    return ["Name", "Roll number", "Class", "Section", "Date"];
  }

  const normalized = value
    .map((field) => (typeof field === "string" ? normalizeField(field) : null))
    .filter((field): field is StudentMetadataField => Boolean(field));

  return normalized.length > 0
    ? Array.from(new Set(normalized))
    : ["Name", "Roll number", "Class", "Section", "Date"];
}

function normalizeSectionPattern(value: unknown, defaultTotalMarks: number) {
  if (Array.isArray(value)) {
    const parsedSections = value
      .map((section) => templateSectionPatternSchema.safeParse(section))
      .filter((result) => result.success)
      .map((result) => result.data);

    if (parsedSections.length > 0) {
      return parsedSections;
    }
  }

  return [
    {
      title: "Section A",
      instructions: typeof value === "string" ? value : "Answer all questions.",
      expectedMarks: defaultTotalMarks,
    },
  ];
}

async function insertTemplateVersion(
  database: DatabaseClient,
  {
    templateId,
    templateVersionId,
    versionNumber,
    input,
    changeReason,
  }: {
    templateId: string;
    templateVersionId: string;
    versionNumber: number;
    input: z.infer<typeof templateFormBoundarySchema>;
    changeReason: string;
  },
) {
  await database.insert(templateVersions).values({
    id: templateVersionId,
    templateId,
    versionNumber,
    structure: toTemplateStructure(input),
    changeReason,
  });
}

async function writeAuditLog(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  {
    action,
    targetId,
    metadata,
  }: {
    action: string;
    targetId: string;
    metadata: Record<string, unknown>;
  },
) {
  await database.insert(auditLogs).values({
    id: newId("audit"),
    schoolId: tenant.schoolId,
    workspaceId: tenant.workspaceId,
    actorId: tenant.actorId,
    action,
    targetType: "TEMPLATE",
    targetId,
    metadata,
  });
}

function toTemplateStructure(
  input: z.infer<typeof templateFormBoundarySchema>,
) {
  return {
    schoolName: input.schoolName,
    logoUrl: input.logoUrl ?? "",
    headerText: input.headerText,
    footerText: input.footerText,
    examInstructions: input.examInstructions,
    studentMetadataFields: input.studentMetadataFields,
    defaultDurationMinutes: input.defaultDurationMinutes,
    defaultTotalMarks: input.defaultTotalMarks,
    sectionPattern: input.sectionPattern,
    pageRuleNotes: input.pageRuleNotes,
  };
}

function normalizeField(value: string): StudentMetadataField | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === "roll number" || normalized === "roll no") {
    return "Roll number";
  }

  return (
    studentMetadataFields.find((field) => field.toLowerCase() === normalized) ??
    null
  );
}

function toStringValue(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function toNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeTimestamp(timestamp: string) {
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? timestamp : parsed.toISOString();
}

function newId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}
