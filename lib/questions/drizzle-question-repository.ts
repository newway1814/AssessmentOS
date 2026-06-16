import { randomUUID } from "node:crypto";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import {
  answerKeys,
  auditLogs,
  chapters,
  grades,
  questionSources,
  questionVersions,
  questions,
  subjects,
  subtopics,
} from "@/db/schema";
import type { DatabaseClient } from "@/lib/db/client";
import {
  questionInputSchema,
  questionSourceInputSchema,
} from "@/lib/domain/schemas";
import type { RepositoryWorkspaceContext } from "@/lib/auth/session";
import type {
  QuestionRepositoryAdapter,
  QuestionRepositoryAnswerKey,
  QuestionRepositoryFormValues,
  QuestionRepositoryItem,
} from "@/lib/questions/types";

const answerKeyBoundarySchema = z.object({
  answer: z.string().max(10000),
  explanation: z.string().max(10000).optional(),
  isComplete: z.boolean(),
});

const questionFormBoundarySchema = z.object({
  subjectName: z.string().min(1).max(200),
  gradeName: z.string().min(1).max(200),
  chapterName: z.string().max(200).optional(),
  subtopicName: z.string().max(200).optional(),
  source: questionSourceInputSchema,
  answerKey: answerKeyBoundarySchema,
});

const answerKeyContentSchema = z.object({
  answer: z.string().default(""),
  explanation: z.string().optional(),
});

type QuestionRow = typeof questions.$inferSelect;
type QuestionSourceRow = typeof questionSources.$inferSelect;
type QuestionVersionRow = typeof questionVersions.$inferSelect;

export function createDrizzleQuestionRepository(
  database: DatabaseClient,
  tenant: RepositoryWorkspaceContext,
): QuestionRepositoryAdapter {
  return {
    async listQuestions() {
      const rows = await database
        .select()
        .from(questions)
        .where(
          and(
            eq(questions.schoolId, tenant.schoolId),
            eq(questions.workspaceId, tenant.workspaceId),
          ),
        )
        .orderBy(desc(questions.updatedAt));

      return Promise.all(
        rows.map((question) => mapQuestionItem(database, question)),
      );
    },

    async createQuestion(input) {
      const parsed = await parseQuestionForm(database, tenant, input);
      const now = new Date().toISOString();
      const questionId = newId("question");
      const sourceId = newId("source");
      const questionVersionId = newId("question-version");

      await database.insert(questionSources).values({
        id: sourceId,
        schoolId: tenant.schoolId,
        workspaceId: tenant.workspaceId,
        createdById: tenant.actorId,
        sourceType: parsed.source.sourceType,
        title: parsed.source.title,
        author: emptyToNull(parsed.source.author),
        owner: emptyToNull(parsed.source.owner),
        license: emptyToNull(parsed.source.license),
        rightsStatus: parsed.source.rightsStatus,
        usageRights: parsed.source.usageRights,
        attributionText: emptyToNull(parsed.source.attributionText),
        originalUrl: emptyToNull(parsed.source.originalUrl),
        verifiedAt: parsed.source.rightsStatus === "VERIFIED" ? now : null,
        updatedAt: now,
      });

      await database.insert(questions).values({
        id: questionId,
        schoolId: tenant.schoolId,
        workspaceId: tenant.workspaceId,
        sourceId,
        subjectId: parsed.question.subjectId,
        gradeId: parsed.question.gradeId,
        chapterId: parsed.question.chapterId,
        subtopicId: parsed.question.subtopicId,
        createdById: tenant.actorId,
        type: parsed.question.type,
        prompt: parsed.question.prompt,
        marks: parsed.question.marks,
        difficulty: emptyToNull(parsed.question.difficulty),
        status: parsed.answerKey.isComplete ? "READY" : "DRAFT",
        updatedAt: now,
      });

      await insertQuestionVersion(database, {
        questionId,
        questionVersionId,
        versionNumber: 1,
        input: parsed,
        tenant,
        now,
        changeReason: "Initial question repository version.",
      });

      await writeAuditLog(database, tenant, {
        action: "question.created",
        targetId: questionId,
        metadata: { sourceId, versionNumber: 1 },
      });

      return getQuestionOrThrow(database, tenant, questionId);
    },

    async updateQuestion(id, input) {
      const existing = await findTenantQuestion(database, tenant, id);

      if (!existing) {
        throw new Error(`Question ${id} was not found.`);
      }

      const parsed = await parseQuestionForm(database, tenant, input);
      const now = new Date().toISOString();
      const nextVersionNumber =
        (await getLatestVersion(database, existing.id))?.versionNumber ?? 0;
      const questionVersionId = newId("question-version");

      await database
        .update(questionSources)
        .set({
          sourceType: parsed.source.sourceType,
          title: parsed.source.title,
          author: emptyToNull(parsed.source.author),
          owner: emptyToNull(parsed.source.owner),
          license: emptyToNull(parsed.source.license),
          rightsStatus: parsed.source.rightsStatus,
          usageRights: parsed.source.usageRights,
          attributionText: emptyToNull(parsed.source.attributionText),
          originalUrl: emptyToNull(parsed.source.originalUrl),
          verifiedAt: parsed.source.rightsStatus === "VERIFIED" ? now : null,
          updatedAt: now,
        })
        .where(eq(questionSources.id, existing.sourceId));

      await database
        .update(questions)
        .set({
          subjectId: parsed.question.subjectId,
          gradeId: parsed.question.gradeId,
          chapterId: parsed.question.chapterId,
          subtopicId: parsed.question.subtopicId,
          type: parsed.question.type,
          prompt: parsed.question.prompt,
          marks: parsed.question.marks,
          difficulty: emptyToNull(parsed.question.difficulty),
          status:
            existing.status === "ARCHIVED"
              ? "ARCHIVED"
              : parsed.answerKey.isComplete
                ? "READY"
                : "DRAFT",
          updatedAt: now,
        })
        .where(eq(questions.id, existing.id));

      await insertQuestionVersion(database, {
        questionId: existing.id,
        questionVersionId,
        versionNumber: nextVersionNumber + 1,
        input: parsed,
        tenant,
        now,
        changeReason: "Question repository edit.",
      });

      await writeAuditLog(database, tenant, {
        action: "question.updated",
        targetId: existing.id,
        metadata: { versionNumber: nextVersionNumber + 1 },
      });

      return getQuestionOrThrow(database, tenant, existing.id);
    },

    async archiveQuestion(id) {
      const existing = await findTenantQuestion(database, tenant, id);

      if (!existing) {
        throw new Error(`Question ${id} was not found.`);
      }

      const now = new Date().toISOString();

      await database
        .update(questions)
        .set({ status: "ARCHIVED", updatedAt: now })
        .where(eq(questions.id, existing.id));

      await writeAuditLog(database, tenant, {
        action: "question.archived",
        targetId: existing.id,
        metadata: { sourceId: existing.sourceId },
      });

      return getQuestionOrThrow(database, tenant, existing.id);
    },
  };
}

async function parseQuestionForm(
  database: DatabaseClient,
  tenant: RepositoryWorkspaceContext,
  input: QuestionRepositoryFormValues,
) {
  const boundary = questionFormBoundarySchema.parse(input);
  const subject = await ensureSubject(database, tenant, boundary.subjectName);
  const grade = await ensureGrade(database, tenant, boundary.gradeName);
  const chapter = await ensureChapter(
    database,
    tenant,
    subject.id,
    boundary.chapterName,
  );
  const subtopic = await ensureSubtopic(
    database,
    tenant,
    chapter?.id,
    boundary.subtopicName,
  );
  const question = questionInputSchema.parse({
    schoolId: tenant.schoolId,
    workspaceId: tenant.workspaceId,
    sourceId: "source-boundary",
    subjectId: subject.id,
    gradeId: grade.id,
    chapterId: chapter?.id,
    subtopicId: subtopic?.id,
    type: input.type,
    prompt: input.prompt,
    marks: input.marks,
    difficulty: input.difficulty,
  });

  return {
    question,
    source: boundary.source,
    answerKey: boundary.answerKey,
    taxonomy: {
      subjectName: subject.name,
      gradeName: grade.name,
      chapterName: chapter?.name,
      subtopicName: subtopic?.name,
    },
  };
}

async function getQuestionOrThrow(
  database: DatabaseClient,
  tenant: RepositoryWorkspaceContext,
  questionId: string,
) {
  const question = await findTenantQuestion(database, tenant, questionId);

  if (!question) {
    throw new Error(`Question ${questionId} was not found.`);
  }

  return mapQuestionItem(database, question);
}

async function findTenantQuestion(
  database: DatabaseClient,
  tenant: RepositoryWorkspaceContext,
  questionId: string,
) {
  const [question] = await database
    .select()
    .from(questions)
    .where(
      and(
        eq(questions.id, questionId),
        eq(questions.schoolId, tenant.schoolId),
        eq(questions.workspaceId, tenant.workspaceId),
      ),
    )
    .limit(1);

  return question;
}

async function mapQuestionItem(
  database: DatabaseClient,
  question: QuestionRow,
): Promise<QuestionRepositoryItem> {
  const [source] = await database
    .select()
    .from(questionSources)
    .where(eq(questionSources.id, question.sourceId))
    .limit(1);

  if (!source) {
    throw new Error(`Question source ${question.sourceId} was not found.`);
  }

  const [subject] = await database
    .select()
    .from(subjects)
    .where(eq(subjects.id, question.subjectId))
    .limit(1);
  const [grade] = await database
    .select()
    .from(grades)
    .where(eq(grades.id, question.gradeId))
    .limit(1);
  const [chapter] = question.chapterId
    ? await database
        .select()
        .from(chapters)
        .where(eq(chapters.id, question.chapterId))
        .limit(1)
    : [];
  const [subtopic] = question.subtopicId
    ? await database
        .select()
        .from(subtopics)
        .where(eq(subtopics.id, question.subtopicId))
        .limit(1)
    : [];
  const latestVersion = await getLatestVersion(database, question.id);
  const answerKey = await getAnswerKey(database, question.id, latestVersion);

  return {
    id: question.id,
    schoolId: question.schoolId,
    workspaceId: question.workspaceId,
    sourceId: question.sourceId,
    subjectId: question.subjectId,
    subjectName: subject?.name ?? "Unknown subject",
    gradeId: question.gradeId,
    gradeName: grade?.name ?? "Unknown grade",
    chapterId: question.chapterId ?? undefined,
    chapterName: chapter?.name,
    subtopicId: question.subtopicId ?? undefined,
    subtopicName: subtopic?.name,
    type: question.type,
    prompt: question.prompt,
    marks: question.marks,
    difficulty: question.difficulty ?? undefined,
    status: question.status,
    source: mapQuestionSource(source),
    answerKey,
    versionNumber: latestVersion?.versionNumber ?? 1,
    updatedAt: normalizeTimestamp(question.updatedAt),
  };
}

async function getLatestVersion(database: DatabaseClient, questionId: string) {
  const [latestVersion] = await database
    .select()
    .from(questionVersions)
    .where(eq(questionVersions.questionId, questionId))
    .orderBy(desc(questionVersions.versionNumber))
    .limit(1);

  return latestVersion;
}

async function getAnswerKey(
  database: DatabaseClient,
  questionId: string,
  latestVersion?: QuestionVersionRow,
): Promise<QuestionRepositoryAnswerKey> {
  const rows = latestVersion
    ? await database
        .select()
        .from(answerKeys)
        .where(eq(answerKeys.questionVersionId, latestVersion.id))
        .limit(1)
    : [];
  const [row] =
    rows.length > 0
      ? rows
      : await database
          .select()
          .from(answerKeys)
          .where(eq(answerKeys.questionId, questionId))
          .orderBy(desc(answerKeys.createdAt))
          .limit(1);

  if (!row) {
    return { answer: "", explanation: "", isComplete: false };
  }

  const content = answerKeyContentSchema.parse(row.content);

  return {
    answer: content.answer,
    explanation: content.explanation ?? "",
    isComplete: row.isComplete,
  };
}

function mapQuestionSource(source: QuestionSourceRow) {
  return questionSourceInputSchema.parse({
    sourceType: source.sourceType,
    title: source.title,
    author: source.author ?? undefined,
    owner: source.owner ?? undefined,
    license: source.license ?? undefined,
    rightsStatus: source.rightsStatus,
    usageRights: source.usageRights,
    attributionText: source.attributionText ?? undefined,
    originalUrl: source.originalUrl ?? undefined,
  });
}

async function ensureSubject(
  database: DatabaseClient,
  tenant: RepositoryWorkspaceContext,
  name: string,
) {
  const normalizedName = name.trim();
  const [existing] = await database
    .select()
    .from(subjects)
    .where(
      and(
        eq(subjects.workspaceId, tenant.workspaceId),
        eq(subjects.name, normalizedName),
      ),
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  const subject = {
    id: newId("subject"),
    schoolId: tenant.schoolId,
    workspaceId: tenant.workspaceId,
    name: normalizedName,
  };

  await database.insert(subjects).values(subject);
  return subject;
}

async function ensureGrade(
  database: DatabaseClient,
  tenant: RepositoryWorkspaceContext,
  name: string,
) {
  const normalizedName = name.trim();
  const [existing] = await database
    .select()
    .from(grades)
    .where(
      and(
        eq(grades.workspaceId, tenant.workspaceId),
        eq(grades.name, normalizedName),
      ),
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  const grade = {
    id: newId("grade"),
    schoolId: tenant.schoolId,
    workspaceId: tenant.workspaceId,
    name: normalizedName,
    order: parseGradeOrder(normalizedName),
  };

  await database.insert(grades).values(grade);
  return grade;
}

async function ensureChapter(
  database: DatabaseClient,
  tenant: RepositoryWorkspaceContext,
  subjectId: string,
  name?: string,
) {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return undefined;
  }

  const [existing] = await database
    .select()
    .from(chapters)
    .where(
      and(eq(chapters.subjectId, subjectId), eq(chapters.name, normalizedName)),
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  const chapter = {
    id: newId("chapter"),
    schoolId: tenant.schoolId,
    workspaceId: tenant.workspaceId,
    subjectId,
    name: normalizedName,
    order: 999,
  };

  await database.insert(chapters).values(chapter);
  return chapter;
}

async function ensureSubtopic(
  database: DatabaseClient,
  tenant: RepositoryWorkspaceContext,
  chapterId?: string,
  name?: string,
) {
  const normalizedName = name?.trim();

  if (!chapterId || !normalizedName) {
    return undefined;
  }

  const [existing] = await database
    .select()
    .from(subtopics)
    .where(
      and(
        eq(subtopics.chapterId, chapterId),
        eq(subtopics.name, normalizedName),
      ),
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  const subtopic = {
    id: newId("subtopic"),
    schoolId: tenant.schoolId,
    workspaceId: tenant.workspaceId,
    chapterId,
    name: normalizedName,
    order: 999,
  };

  await database.insert(subtopics).values(subtopic);
  return subtopic;
}

async function insertQuestionVersion(
  database: DatabaseClient,
  {
    questionId,
    questionVersionId,
    versionNumber,
    input,
    tenant,
    now,
    changeReason,
  }: {
    questionId: string;
    questionVersionId: string;
    versionNumber: number;
    input: Awaited<ReturnType<typeof parseQuestionForm>>;
    tenant: RepositoryWorkspaceContext;
    now: string;
    changeReason: string;
  },
) {
  const answerKeyContent = {
    answer: input.answerKey.answer,
    explanation: input.answerKey.explanation,
  };

  await database.insert(questionVersions).values({
    id: questionVersionId,
    questionId,
    editedById: tenant.actorId,
    versionNumber,
    promptSnapshot: input.question.prompt,
    metadataSnapshot: {
      subjectId: input.question.subjectId,
      subjectName: input.taxonomy.subjectName,
      gradeId: input.question.gradeId,
      gradeName: input.taxonomy.gradeName,
      chapterId: input.question.chapterId,
      chapterName: input.taxonomy.chapterName,
      subtopicId: input.question.subtopicId,
      subtopicName: input.taxonomy.subtopicName,
      marks: input.question.marks,
      difficulty: input.question.difficulty,
      type: input.question.type,
    },
    sourceSnapshot: input.source,
    answerKeySnapshot: answerKeyContent,
    changeReason,
  });

  await database.insert(answerKeys).values({
    id: newId("answer-key"),
    questionId,
    questionVersionId,
    content: answerKeyContent,
    isComplete: input.answerKey.isComplete,
    updatedAt: now,
  });
}

async function writeAuditLog(
  database: DatabaseClient,
  tenant: RepositoryWorkspaceContext,
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
    targetType: "QUESTION",
    targetId,
    metadata,
  });
}

function parseGradeOrder(name: string) {
  const match = name.match(/\d+/);
  return match ? Number(match[0]) : 999;
}

function newId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeTimestamp(timestamp: string) {
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? timestamp : parsed.toISOString();
}
