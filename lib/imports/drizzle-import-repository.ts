import { randomUUID } from "node:crypto";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { auditLogs, importBatches, importCandidates, users } from "@/db/schema";
import { db as defaultDb, type DatabaseClient } from "@/lib/db/client";
import { rightsStatuses, sourceTypes } from "@/lib/domain/constants";
import { createMockNormalizedQuestions } from "@/lib/imports/helpers";
import {
  importSourceOptions,
  type NormalizedQuestionCard,
  type QuestionImportAdapter,
  type QuestionImportBatch,
} from "@/lib/imports/types";
import { demoTenantContext, type DemoTenantContext } from "@/lib/demo-tenant";
import { createDrizzleQuestionRepository } from "@/lib/questions/drizzle-question-repository";

const newImportBoundarySchema = z.object({
  sourceOption: z.enum(importSourceOptions),
  pastedText: z.string().max(50000),
  fileName: z.string().max(300),
  sourceTitle: z.string().max(200),
  sourceReference: z.string().max(500),
  sourceType: z.enum(sourceTypes),
  rightsStatus: z.enum(rightsStatuses),
});

const candidateBoundarySchema = z.object({
  prompt: z.string().min(1).max(10000),
  gradeName: z.string().min(1).max(200),
  subjectName: z.string().min(1).max(200),
  chapterName: z.string().max(200),
  subtopicName: z.string().max(200),
  marks: z.number().int().min(0).max(500),
  difficulty: z.string().max(100),
  type: z.enum([
    "MULTIPLE_CHOICE",
    "SHORT_ANSWER",
    "LONG_ANSWER",
    "TRUE_FALSE",
    "FILL_IN_THE_BLANK",
    "MATCHING",
  ]),
  answerKey: z.string().max(10000),
  sourceType: z.enum(sourceTypes),
  rightsStatus: z.enum(rightsStatuses),
  sourceTitle: z.string().min(1).max(200),
  sourceReference: z.string().min(1).max(500),
  usageRights: z.string().min(1).max(1000),
});

const normalizationMetadataSchema = z
  .object({
    fileName: z.string().optional(),
    mode: z.string().optional(),
    note: z.string().optional(),
    sourceReference: z.string().optional(),
  })
  .passthrough();

type ImportBatchRow = typeof importBatches.$inferSelect;
type ImportCandidateRow = typeof importCandidates.$inferSelect;

export function createDrizzleImportRepository(
  database: DatabaseClient = defaultDb,
  tenant: DemoTenantContext = demoTenantContext,
): QuestionImportAdapter {
  return {
    async listImports() {
      const rows = await database
        .select()
        .from(importBatches)
        .where(
          and(
            eq(importBatches.schoolId, tenant.schoolId),
            eq(importBatches.workspaceId, tenant.workspaceId),
          ),
        )
        .orderBy(desc(importBatches.updatedAt));

      return Promise.all(rows.map((batch) => mapBatch(database, batch)));
    },

    async getImport(importId) {
      const batch = await findTenantBatch(database, tenant, importId);
      return batch ? mapBatch(database, batch) : undefined;
    },

    async createMockImport(draft) {
      const parsed = newImportBoundarySchema.parse(draft);
      const now = new Date().toISOString();
      const importBatchId = newId("import");
      const normalizedQuestions = createMockNormalizedQuestions(parsed);
      const title =
        parsed.sourceTitle.trim() ||
        parsed.fileName.trim() ||
        "New import draft";

      await database.insert(importBatches).values({
        id: importBatchId,
        schoolId: tenant.schoolId,
        workspaceId: tenant.workspaceId,
        submittedById: tenant.actorId,
        title,
        sourceOption: parsed.sourceOption,
        status: normalizedQuestions.length > 0 ? "NEEDS_REVIEW" : "UPLOADED",
        rawText: emptyToNull(parsed.pastedText),
        normalizationMetadata: {
          fileName: emptyToUndefined(parsed.fileName),
          mode: "mock",
          note: "No AI, OCR, upload storage, or external scraping is connected.",
          sourceReference: emptyToUndefined(parsed.sourceReference),
        },
        rightsAcknowledgedAt: now,
        updatedAt: now,
      });

      await database.insert(importCandidates).values(
        normalizedQuestions.map((candidate) => ({
          id: newId("import-candidate"),
          importBatchId,
          prompt: candidate.prompt,
          subjectName: candidate.subjectName,
          gradeName: candidate.gradeName,
          chapterName: emptyToNull(candidate.chapterName),
          subtopicName: emptyToNull(candidate.subtopicName),
          type: candidate.type,
          marks: candidate.marks,
          difficulty: emptyToNull(candidate.difficulty),
          answerKeyDraft: emptyToNull(candidate.answerKey),
          sourceType: candidate.sourceType,
          rightsStatus: candidate.rightsStatus,
          sourceTitle: candidate.sourceTitle,
          sourceReference: candidate.sourceReference,
          usageRights: candidate.usageRights,
          confidence: candidate.confidence,
          reviewStatus: "NEEDS_REVIEW" as const,
          updatedAt: now,
        })),
      );

      await writeAuditLog(database, tenant, {
        action: "import.created",
        targetId: importBatchId,
        targetType: "IMPORT_BATCH",
        metadata: {
          sourceOption: parsed.sourceOption,
          candidateCount: normalizedQuestions.length,
        },
      });

      return getBatchOrThrow(database, tenant, importBatchId);
    },

    async updateCandidate(importId, candidateId, input) {
      const { batch, candidate } = await getTenantCandidateOrThrow(
        database,
        tenant,
        importId,
        candidateId,
      );
      const parsed = candidateBoundarySchema.parse(input);
      const now = new Date().toISOString();

      await database
        .update(importCandidates)
        .set({
          prompt: parsed.prompt,
          gradeName: parsed.gradeName,
          subjectName: parsed.subjectName,
          chapterName: emptyToNull(parsed.chapterName),
          subtopicName: emptyToNull(parsed.subtopicName),
          type: parsed.type,
          marks: parsed.marks,
          difficulty: emptyToNull(parsed.difficulty),
          answerKeyDraft: emptyToNull(parsed.answerKey),
          sourceType: parsed.sourceType,
          rightsStatus: parsed.rightsStatus,
          sourceTitle: parsed.sourceTitle,
          sourceReference: parsed.sourceReference,
          usageRights: parsed.usageRights,
          updatedAt: now,
        })
        .where(eq(importCandidates.id, candidate.id));

      await touchBatch(database, batch.id, now);
      await writeAuditLog(database, tenant, {
        action: "import.candidate.updated",
        targetId: candidate.id,
        targetType: "IMPORT_CANDIDATE",
        metadata: { importBatchId: batch.id },
      });

      return getBatchOrThrow(database, tenant, batch.id);
    },

    async approveCandidate(importId, candidateId) {
      const { batch, candidate } = await getTenantCandidateOrThrow(
        database,
        tenant,
        importId,
        candidateId,
      );
      const now = new Date().toISOString();
      let approvedQuestionId = candidate.approvedQuestionId;

      if (!approvedQuestionId) {
        const questionRepository = createDrizzleQuestionRepository(
          database,
          tenant,
        );
        const question = await questionRepository.createQuestion(
          questionInputFromCandidate(candidate),
        );
        approvedQuestionId = question.id;
      }

      await database
        .update(importCandidates)
        .set({
          approvedQuestionId,
          reviewedById: tenant.actorId,
          reviewStatus: "APPROVED",
          updatedAt: now,
        })
        .where(eq(importCandidates.id, candidate.id));
      await updateBatchStatus(database, batch.id, now);
      await writeAuditLog(database, tenant, {
        action: "import.candidate.approved",
        targetId: candidate.id,
        targetType: "IMPORT_CANDIDATE",
        metadata: { importBatchId: batch.id, approvedQuestionId },
      });

      return getBatchOrThrow(database, tenant, batch.id);
    },

    async rejectCandidate(importId, candidateId) {
      return updateCandidateStatus(database, tenant, {
        importId,
        candidateId,
        status: "REJECTED",
        action: "import.candidate.rejected",
      });
    },

    async markCandidateForLater(importId, candidateId) {
      return updateCandidateStatus(database, tenant, {
        importId,
        candidateId,
        status: "EDIT_LATER",
        action: "import.candidate.edit_later",
      });
    },
  };
}

export const drizzleImportRepository = createDrizzleImportRepository();

async function updateCandidateStatus(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  {
    importId,
    candidateId,
    status,
    action,
  }: {
    importId: string;
    candidateId: string;
    status: "REJECTED" | "EDIT_LATER";
    action: string;
  },
) {
  const { batch, candidate } = await getTenantCandidateOrThrow(
    database,
    tenant,
    importId,
    candidateId,
  );
  const now = new Date().toISOString();

  await database
    .update(importCandidates)
    .set({
      reviewedById: tenant.actorId,
      reviewStatus: status,
      updatedAt: now,
    })
    .where(eq(importCandidates.id, candidate.id));
  await updateBatchStatus(database, batch.id, now);
  await writeAuditLog(database, tenant, {
    action,
    targetId: candidate.id,
    targetType: "IMPORT_CANDIDATE",
    metadata: { importBatchId: batch.id },
  });

  return getBatchOrThrow(database, tenant, batch.id);
}

async function mapBatch(
  database: DatabaseClient,
  batch: ImportBatchRow,
): Promise<QuestionImportBatch> {
  const [submittedBy] = await database
    .select()
    .from(users)
    .where(eq(users.id, batch.submittedById))
    .limit(1);
  const candidates = await database
    .select()
    .from(importCandidates)
    .where(eq(importCandidates.importBatchId, batch.id))
    .orderBy(importCandidates.createdAt);
  const metadata = normalizationMetadataSchema.parse(
    batch.normalizationMetadata ?? {},
  );
  const normalizedQuestions = candidates.map(mapCandidate);

  return {
    id: batch.id,
    title: batch.title,
    sourceOption: batch.sourceOption,
    status: batch.status,
    submittedBy: submittedBy?.name ?? "Unknown user",
    createdAt: normalizeTimestamp(batch.createdAt),
    questionCount: normalizedQuestions.length,
    rightsSummary: buildRightsSummary(normalizedQuestions),
    pastedText: batch.rawText ?? undefined,
    fileName: metadata.fileName,
    normalizedQuestions,
  };
}

function mapCandidate(candidate: ImportCandidateRow): NormalizedQuestionCard {
  return {
    id: candidate.id,
    approvedQuestionId: candidate.approvedQuestionId ?? undefined,
    prompt: candidate.prompt,
    gradeName: candidate.gradeName,
    subjectName: candidate.subjectName,
    chapterName: candidate.chapterName ?? "",
    subtopicName: candidate.subtopicName ?? "",
    marks: candidate.marks,
    difficulty: candidate.difficulty ?? "",
    type: candidate.type,
    answerKey: candidate.answerKeyDraft ?? "",
    sourceType: candidate.sourceType,
    rightsStatus: candidate.rightsStatus,
    sourceTitle: candidate.sourceTitle,
    sourceReference: candidate.sourceReference,
    usageRights: candidate.usageRights,
    status: candidate.reviewStatus,
    confidence: candidate.confidence ?? 0,
  };
}

async function findTenantBatch(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  importId: string,
) {
  const [batch] = await database
    .select()
    .from(importBatches)
    .where(
      and(
        eq(importBatches.id, importId),
        eq(importBatches.schoolId, tenant.schoolId),
        eq(importBatches.workspaceId, tenant.workspaceId),
      ),
    )
    .limit(1);

  return batch;
}

async function getBatchOrThrow(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  importId: string,
) {
  const batch = await findTenantBatch(database, tenant, importId);

  if (!batch) {
    throw new Error(`Import batch ${importId} was not found.`);
  }

  return mapBatch(database, batch);
}

async function getTenantCandidateOrThrow(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  importId: string,
  candidateId: string,
) {
  const batch = await findTenantBatch(database, tenant, importId);

  if (!batch) {
    throw new Error(`Import batch ${importId} was not found.`);
  }

  const [candidate] = await database
    .select()
    .from(importCandidates)
    .where(
      and(
        eq(importCandidates.id, candidateId),
        eq(importCandidates.importBatchId, batch.id),
      ),
    )
    .limit(1);

  if (!candidate) {
    throw new Error(`Import candidate ${candidateId} was not found.`);
  }

  return { batch, candidate };
}

async function updateBatchStatus(
  database: DatabaseClient,
  importBatchId: string,
  timestamp: string,
) {
  const candidates = await database
    .select()
    .from(importCandidates)
    .where(eq(importCandidates.importBatchId, importBatchId));
  const nextStatus =
    candidates.length === 0
      ? "UPLOADED"
      : candidates.every((candidate) => candidate.reviewStatus === "APPROVED")
        ? "APPROVED"
        : candidates.every((candidate) => candidate.reviewStatus === "REJECTED")
          ? "REJECTED"
          : "NEEDS_REVIEW";

  await database
    .update(importBatches)
    .set({ status: nextStatus, updatedAt: timestamp })
    .where(eq(importBatches.id, importBatchId));
}

async function touchBatch(
  database: DatabaseClient,
  importBatchId: string,
  timestamp: string,
) {
  await database
    .update(importBatches)
    .set({ updatedAt: timestamp })
    .where(eq(importBatches.id, importBatchId));
}

function questionInputFromCandidate(candidate: ImportCandidateRow) {
  return {
    subjectId: "",
    subjectName: candidate.subjectName,
    gradeId: "",
    gradeName: candidate.gradeName,
    chapterName: candidate.chapterName ?? undefined,
    subtopicName: candidate.subtopicName ?? undefined,
    type: candidate.type,
    prompt: candidate.prompt,
    marks: candidate.marks,
    difficulty: candidate.difficulty ?? undefined,
    source: {
      sourceType: candidate.sourceType,
      title: candidate.sourceTitle,
      rightsStatus: candidate.rightsStatus,
      usageRights: candidate.usageRights,
      attributionText: candidate.sourceReference,
    },
    answerKey: {
      answer: candidate.answerKeyDraft ?? "",
      isComplete: Boolean(candidate.answerKeyDraft?.trim()),
    },
  };
}

async function writeAuditLog(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  {
    action,
    targetId,
    targetType,
    metadata,
  }: {
    action: string;
    targetId: string;
    targetType: string;
    metadata: Record<string, unknown>;
  },
) {
  await database.insert(auditLogs).values({
    id: newId("audit"),
    schoolId: tenant.schoolId,
    workspaceId: tenant.workspaceId,
    actorId: tenant.actorId,
    action,
    targetType,
    targetId,
    metadata,
  });
}

function buildRightsSummary(candidates: NormalizedQuestionCard[]) {
  if (candidates.length === 0) {
    return "Awaiting mock normalization candidates.";
  }

  const restrictedCount = candidates.filter(
    (candidate) => candidate.rightsStatus === "RESTRICTED",
  ).length;

  if (restrictedCount > 0) {
    return `${restrictedCount} candidates require rights review before approval.`;
  }

  return "Source and usage-rights metadata retained for all candidates.";
}

function newId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function emptyToUndefined(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeTimestamp(timestamp: string) {
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? timestamp : parsed.toISOString();
}
