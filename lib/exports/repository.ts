import { randomUUID } from "node:crypto";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import {
  auditLogs,
  exportRequests,
  templates,
  templateVersions,
} from "@/db/schema";
import { db as defaultDb, type DatabaseClient } from "@/lib/db/client";
import { demoTenantContext, type DemoTenantContext } from "@/lib/demo-tenant";
import {
  buildExportPreview,
  buildExportReadinessSummary,
  isExportReady,
} from "@/lib/exports/helpers";
import type {
  ExportCopyMode,
  ExportRepositoryAdapter,
  ExportRequestInput,
  ExportRequestItem,
  ExportRequestStatus,
  PersistedPaperExportPreview,
} from "@/lib/exports/types";
import { createDrizzlePaperRepository } from "@/lib/papers/drizzle-paper-repository";
import { createDrizzleTemplateRepository } from "@/lib/templates/drizzle-template-repository";
import type { SchoolTemplateItem } from "@/lib/templates/types";

const exportFormats = ["PDF", "DOCX", "PRINT"] as const;
const exportCopyModes = ["STUDENT", "TEACHER", "ASSIGNMENT"] as const;
const exportPreviewModes = ["ASSESSMENT", "ASSIGNMENT"] as const;
const persistedExportStatuses = [
  "DRAFT",
  "READY",
  "QUEUED",
  "GENERATED_PLACEHOLDER",
  "FAILED",
] as const;

const exportRequestBoundarySchema = z.object({
  paperId: z.string().min(1),
  format: z.enum(exportFormats),
  copyType: z.enum(exportCopyModes),
  answerKeyVisible: z.boolean(),
  previewMode: z.enum(exportPreviewModes),
});

const previewStateBoundarySchema = z.object({
  copyType: z.enum(exportCopyModes),
  answerKeyVisible: z.boolean(),
  previewMode: z.enum(exportPreviewModes),
});

const exportStatusBoundarySchema = z.object({
  format: z.enum(exportFormats),
  status: z.enum(["QUEUED", "GENERATED_PLACEHOLDER", "FAILED"]),
});

const readinessSummarySchema = z
  .object({
    ready: z.boolean().default(false),
    blockers: z.array(z.string()).default([]),
    answerKeyVisible: z.boolean().default(false),
    previewMode: z.enum(exportPreviewModes).default("ASSESSMENT"),
    checklist: z.array(z.unknown()).default([]),
    status: z.string().optional(),
  })
  .passthrough();

type ExportRequestRow = typeof exportRequests.$inferSelect;

export function createDrizzleExportRepository(
  database: DatabaseClient = defaultDb,
  tenant: DemoTenantContext = demoTenantContext,
): ExportRepositoryAdapter {
  return {
    async listExportRequests() {
      const rows = await database
        .select()
        .from(exportRequests)
        .where(
          and(
            eq(exportRequests.schoolId, tenant.schoolId),
            eq(exportRequests.workspaceId, tenant.workspaceId),
          ),
        )
        .orderBy(desc(exportRequests.updatedAt));

      return Promise.all(
        rows.map((row) => mapExportRequest(database, tenant, row)),
      );
    },

    async listExportPreviews() {
      const papers = await createDrizzlePaperRepository(
        database,
        tenant,
      ).listPapers();

      return Promise.all(
        papers.map((paper) => getPreviewForPaper(database, tenant, paper.id)),
      ).then((previews) =>
        previews.filter((preview): preview is PersistedPaperExportPreview =>
          Boolean(preview),
        ),
      );
    },

    async getExportPreview(paperId) {
      return getPreviewForPaper(database, tenant, paperId);
    },

    async createExportRequest(input) {
      const parsed = exportRequestBoundarySchema.parse(input);
      return createOrUpdateExportRequest(database, tenant, parsed, "DRAFT");
    },

    async updatePreviewState(paperId, input) {
      const parsed = previewStateBoundarySchema.parse(input);
      const existing = await getLatestRequestForPaper(
        database,
        tenant,
        paperId,
      );
      await createOrUpdateExportRequest(
        database,
        tenant,
        {
          paperId,
          format: existing?.format ?? "PRINT",
          copyType: parsed.copyType,
          answerKeyVisible: parsed.answerKeyVisible,
          previewMode: parsed.previewMode,
        },
        normalizeExportStatus(existing?.status) ?? "DRAFT",
      );

      return getPreviewOrThrow(database, tenant, paperId);
    },

    async updateExportStatus(paperId, input) {
      const parsed = exportStatusBoundarySchema.parse(input);
      const existing = await getLatestRequestForPaper(
        database,
        tenant,
        paperId,
      );
      const summary = readinessSummarySchema.parse(
        existing?.readinessSummary ?? {},
      );
      await createOrUpdateExportRequest(
        database,
        tenant,
        {
          paperId,
          format: parsed.format,
          copyType: normalizeCopyMode(existing?.copyType) ?? "TEACHER",
          answerKeyVisible: summary.answerKeyVisible,
          previewMode: summary.previewMode,
        },
        parsed.status,
      );

      return getPreviewOrThrow(database, tenant, paperId);
    },
  };
}

export const exportPreviewRepository = createDrizzleExportRepository();

async function createOrUpdateExportRequest(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  input: ExportRequestInput,
  status: ExportRequestStatus,
): Promise<ExportRequestItem> {
  const context = await getExportContext(database, tenant, input.paperId);

  if (!context) {
    throw new Error(`Export context for paper ${input.paperId} was not found.`);
  }

  const { paper, template, templateVersionId } = context;
  const preview = buildExportPreview({ paper, template });
  const ready = isExportReady(preview.checklist);
  const nextStatus = status === "DRAFT" && ready ? "READY" : status;
  const readinessSummary = buildExportReadinessSummary({
    answerKeyVisible: input.answerKeyVisible,
    checklist: preview.checklist,
    copyType: input.copyType,
    status: nextStatus,
  });
  const existing = await getLatestRequestForPaper(database, tenant, paper.id);
  const now = new Date().toISOString();

  if (existing) {
    await database
      .update(exportRequests)
      .set({
        templateVersionId,
        format: input.format,
        copyType: input.copyType,
        status: nextStatus,
        readinessSummary,
        updatedAt: now,
      })
      .where(eq(exportRequests.id, existing.id));

    await writeAuditLog(database, tenant, {
      action: "export.updated",
      targetId: existing.id,
      metadata: { paperId: paper.id, format: input.format, status: nextStatus },
    });

    return getRequestOrThrow(database, tenant, existing.id);
  }

  const requestId = newId("export-request");
  await database.insert(exportRequests).values({
    id: requestId,
    schoolId: tenant.schoolId,
    workspaceId: tenant.workspaceId,
    paperId: paper.id,
    templateVersionId,
    requestedById: tenant.actorId,
    format: input.format,
    copyType: input.copyType,
    status: nextStatus,
    readinessSummary,
    updatedAt: now,
  });

  await writeAuditLog(database, tenant, {
    action: "export.created",
    targetId: requestId,
    metadata: { paperId: paper.id, format: input.format, status: nextStatus },
  });

  return getRequestOrThrow(database, tenant, requestId);
}

async function getPreviewForPaper(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  paperId: string,
): Promise<PersistedPaperExportPreview | undefined> {
  const context = await getExportContext(database, tenant, paperId);

  if (!context) {
    return undefined;
  }

  const preview = buildExportPreview({
    paper: context.paper,
    template: context.template,
  });
  const request = await getLatestRequestForPaper(database, tenant, paperId);
  const mappedRequest = request
    ? await mapExportRequest(database, tenant, request)
    : undefined;
  const summary = readinessSummarySchema.parse(request?.readinessSummary ?? {});
  const copyType = normalizeCopyMode(request?.copyType) ?? "STUDENT";
  const previewMode =
    copyType === "ASSIGNMENT" ? "ASSIGNMENT" : summary.previewMode;

  return {
    ...preview,
    state: {
      request: mappedRequest,
      copyType,
      answerKeyVisible:
        typeof summary.answerKeyVisible === "boolean"
          ? summary.answerKeyVisible
          : copyType === "TEACHER",
      previewMode,
    },
  };
}

async function getPreviewOrThrow(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  paperId: string,
) {
  const preview = await getPreviewForPaper(database, tenant, paperId);

  if (!preview) {
    throw new Error(`Export preview for paper ${paperId} was not found.`);
  }

  return preview;
}

async function getExportContext(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  paperId: string,
) {
  const paper = await createDrizzlePaperRepository(database, tenant).getPaper(
    paperId,
  );

  if (!paper) {
    return undefined;
  }

  const templateVersionId =
    paper.templateVersionId ??
    (await getDefaultTemplateVersionId(database, tenant));

  if (!templateVersionId) {
    return undefined;
  }

  const template = await getTemplateForVersion(
    database,
    tenant,
    templateVersionId,
  );

  if (!template) {
    return undefined;
  }

  return { paper, template, templateVersionId };
}

async function getTemplateForVersion(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  templateVersionId: string,
): Promise<SchoolTemplateItem | undefined> {
  const [version] = await database
    .select()
    .from(templateVersions)
    .where(eq(templateVersions.id, templateVersionId))
    .limit(1);

  if (!version) {
    return undefined;
  }

  return createDrizzleTemplateRepository(database, tenant).getTemplate(
    version.templateId,
  );
}

async function getDefaultTemplateVersionId(
  database: DatabaseClient,
  tenant: DemoTenantContext,
) {
  const [template] = await database
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.schoolId, tenant.schoolId),
        eq(templates.workspaceId, tenant.workspaceId),
      ),
    )
    .orderBy(desc(templates.updatedAt))
    .limit(1);

  if (!template) {
    return undefined;
  }

  const [version] = await database
    .select()
    .from(templateVersions)
    .where(eq(templateVersions.templateId, template.id))
    .orderBy(desc(templateVersions.versionNumber))
    .limit(1);

  return version?.id;
}

async function mapExportRequest(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  request: ExportRequestRow,
): Promise<ExportRequestItem> {
  const paper = await createDrizzlePaperRepository(database, tenant).getPaper(
    request.paperId,
  );
  const template = await getTemplateForVersion(
    database,
    tenant,
    request.templateVersionId,
  );
  const summary = readinessSummarySchema.parse(request.readinessSummary);
  const checklist = z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        isReady: z.boolean(),
        detail: z.string(),
      }),
    )
    .parse(summary.checklist);

  return {
    id: request.id,
    paperId: request.paperId,
    paperTitle: paper?.title ?? "Unknown paper",
    templateVersionId: request.templateVersionId,
    templateName: template?.name ?? "Unknown template",
    format: request.format,
    copyType: normalizeCopyMode(request.copyType) ?? "STUDENT",
    status: normalizeExportStatus(request.status) ?? "GENERATED_PLACEHOLDER",
    answerKeyVisible: summary.answerKeyVisible,
    previewMode: summary.previewMode,
    checklist,
    ready: summary.ready,
    blockerCount: summary.blockers.length,
    updatedAt: normalizeTimestamp(request.updatedAt),
  };
}

async function getLatestRequestForPaper(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  paperId: string,
) {
  const [request] = await database
    .select()
    .from(exportRequests)
    .where(
      and(
        eq(exportRequests.schoolId, tenant.schoolId),
        eq(exportRequests.workspaceId, tenant.workspaceId),
        eq(exportRequests.paperId, paperId),
      ),
    )
    .orderBy(desc(exportRequests.updatedAt))
    .limit(1);

  return request;
}

async function getRequestOrThrow(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  requestId: string,
) {
  const [request] = await database
    .select()
    .from(exportRequests)
    .where(
      and(
        eq(exportRequests.id, requestId),
        eq(exportRequests.schoolId, tenant.schoolId),
        eq(exportRequests.workspaceId, tenant.workspaceId),
      ),
    )
    .limit(1);

  if (!request) {
    throw new Error(`Export request ${requestId} was not found.`);
  }

  return mapExportRequest(database, tenant, request);
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
    targetType: "EXPORT",
    targetId,
    metadata,
  });
}

function normalizeCopyMode(value?: string | null): ExportCopyMode | undefined {
  return exportCopyModes.find((mode) => mode === value);
}

function normalizeExportStatus(
  value?: string | null,
): ExportRequestStatus | undefined {
  if (value === "PLACEHOLDER" || value === "REQUESTED") {
    return "GENERATED_PLACEHOLDER";
  }

  return persistedExportStatuses.find((status) => status === value);
}

function newId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

function normalizeTimestamp(timestamp: string) {
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? timestamp : parsed.toISOString();
}
