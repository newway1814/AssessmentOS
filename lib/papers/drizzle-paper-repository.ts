import { randomUUID } from "node:crypto";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import {
  answerKeys,
  auditLogs,
  chapters,
  grades,
  paperQuestions,
  papers,
  paperSections,
  questionSources,
  questions,
  questionVersions,
  subjects,
  subtopics,
  templates,
  templateVersions,
} from "@/db/schema";
import { db as defaultDb, type DatabaseClient } from "@/lib/db/client";
import { demoTenantContext, type DemoTenantContext } from "@/lib/demo-tenant";
import { paperStatuses } from "@/lib/domain/constants";
import {
  paperInputSchema,
  paperQuestionInputSchema,
  paperSectionInputSchema,
  questionSourceInputSchema,
} from "@/lib/domain/schemas";
import type {
  PaperBuilderAdapter,
  PaperBuilderItem,
  PaperCreateInput,
  PaperQuestionItem,
  PaperSectionItem,
  PaperUpdateInput,
} from "@/lib/papers/types";
import type {
  QuestionRepositoryAnswerKey,
  QuestionRepositoryItem,
} from "@/lib/questions/types";

const paperCreateBoundarySchema = z.object({
  title: z.string().min(1).max(200),
  gradeName: z.string().min(1).max(200),
  subjectName: z.string().min(1).max(200),
  durationMinutes: z.number().int().min(1).max(600),
  totalMarksTarget: z.number().int().min(0).max(500).optional(),
  templateVersionId: z.string().min(1).optional(),
});

const paperUpdateBoundarySchema = paperCreateBoundarySchema.extend({
  status: z.enum(paperStatuses),
});

const sectionCreateBoundarySchema = z.object({
  title: z.string().min(1).max(200),
  instructions: z.string().max(2000).optional(),
  expectedMarks: z.number().int().min(0).max(500).optional(),
});

const sectionUpdateBoundarySchema = sectionCreateBoundarySchema.extend({
  order: z.number().int().min(1),
});

const answerKeyContentSchema = z.object({
  answer: z.string().default(""),
  explanation: z.string().optional(),
});

type PaperRow = typeof papers.$inferSelect;
type PaperSectionRow = typeof paperSections.$inferSelect;
type PaperQuestionRow = typeof paperQuestions.$inferSelect;

export function createDrizzlePaperRepository(
  database: DatabaseClient = defaultDb,
  tenant: DemoTenantContext = demoTenantContext,
): PaperBuilderAdapter {
  return {
    async listPapers() {
      const rows = await database
        .select()
        .from(papers)
        .where(
          and(
            eq(papers.schoolId, tenant.schoolId),
            eq(papers.workspaceId, tenant.workspaceId),
          ),
        )
        .orderBy(desc(papers.updatedAt));

      return Promise.all(rows.map((paper) => mapPaper(database, paper)));
    },

    async getPaper(id) {
      const paper = await findTenantPaper(database, tenant, id);
      return paper ? mapPaper(database, paper) : undefined;
    },

    async createPaper(input) {
      const parsed = await parsePaperCreate(database, tenant, input);
      const now = new Date().toISOString();
      const paperId = newId("paper");

      await database.insert(papers).values({
        id: paperId,
        schoolId: tenant.schoolId,
        workspaceId: tenant.workspaceId,
        subjectId: parsed.subjectId,
        gradeId: parsed.gradeId,
        templateVersionId: parsed.templateVersionId,
        createdById: tenant.actorId,
        title: parsed.title,
        durationMinutes: parsed.durationMinutes,
        totalMarksTarget: parsed.totalMarksTarget,
        status: "DRAFT",
        updatedAt: now,
      });

      await database.insert(paperSections).values({
        id: newId("paper-section"),
        paperId,
        title: "Section A",
        instructions: "Answer all questions.",
        order: 1,
        marks: parsed.totalMarksTarget ?? 0,
        updatedAt: now,
      });

      await writeAuditLog(database, tenant, {
        action: "paper.created",
        targetId: paperId,
        metadata: { title: parsed.title },
      });

      return getPaperOrThrow(database, tenant, paperId);
    },

    async updatePaper(id, input) {
      const existing = await findTenantPaper(database, tenant, id);

      if (!existing) {
        throw new Error(`Paper ${id} was not found.`);
      }

      const parsed = await parsePaperUpdate(database, tenant, input);
      const now = new Date().toISOString();

      await database
        .update(papers)
        .set({
          subjectId: parsed.subjectId,
          gradeId: parsed.gradeId,
          templateVersionId: parsed.templateVersionId,
          title: parsed.title,
          durationMinutes: parsed.durationMinutes,
          totalMarksTarget: parsed.totalMarksTarget,
          status: parsed.status,
          updatedAt: now,
        })
        .where(eq(papers.id, existing.id));

      await writeAuditLog(database, tenant, {
        action: "paper.updated",
        targetId: existing.id,
        metadata: { status: parsed.status },
      });

      return getPaperOrThrow(database, tenant, existing.id);
    },

    async archivePaper(id) {
      const existing = await findTenantPaper(database, tenant, id);

      if (!existing) {
        throw new Error(`Paper ${id} was not found.`);
      }

      await database
        .update(papers)
        .set({ status: "ARCHIVED", updatedAt: new Date().toISOString() })
        .where(eq(papers.id, existing.id));

      await writeAuditLog(database, tenant, {
        action: "paper.archived",
        targetId: existing.id,
        metadata: { previousStatus: existing.status },
      });

      return getPaperOrThrow(database, tenant, existing.id);
    },

    async createSection(paperId, input) {
      const paper = await findTenantPaper(database, tenant, paperId);

      if (!paper) {
        throw new Error(`Paper ${paperId} was not found.`);
      }

      const parsed = sectionCreateBoundarySchema.parse(input);
      const now = new Date().toISOString();
      const order = (await getNextSectionOrder(database, paper.id)) + 1;

      paperSectionInputSchema.parse({
        title: parsed.title,
        instructions: parsed.instructions,
        order,
        marks: parsed.expectedMarks,
      });

      await database.insert(paperSections).values({
        id: newId("paper-section"),
        paperId: paper.id,
        title: parsed.title,
        instructions: emptyToNull(parsed.instructions),
        order,
        marks: parsed.expectedMarks,
        updatedAt: now,
      });

      await touchPaper(database, paper.id, now);
      await writeAuditLog(database, tenant, {
        action: "paper.section.created",
        targetId: paper.id,
        metadata: { order, title: parsed.title },
      });

      return getPaperOrThrow(database, tenant, paper.id);
    },

    async updateSection(paperId, sectionId, input) {
      const section = await findTenantSection(
        database,
        tenant,
        paperId,
        sectionId,
      );

      if (!section) {
        throw new Error(`Paper section ${sectionId} was not found.`);
      }

      const parsed = sectionUpdateBoundarySchema.parse(input);
      const now = new Date().toISOString();

      paperSectionInputSchema.parse({
        title: parsed.title,
        instructions: parsed.instructions,
        order: parsed.order,
        marks: parsed.expectedMarks,
      });

      if (parsed.order !== section.order) {
        await moveSectionToOrder(database, section, parsed.order);
      }

      await database
        .update(paperSections)
        .set({
          title: parsed.title,
          instructions: emptyToNull(parsed.instructions),
          marks: parsed.expectedMarks,
          updatedAt: now,
        })
        .where(eq(paperSections.id, section.id));

      await touchPaper(database, section.paperId, now);
      await writeAuditLog(database, tenant, {
        action: "paper.section.updated",
        targetId: section.paperId,
        metadata: { sectionId: section.id, order: parsed.order },
      });

      return getPaperOrThrow(database, tenant, section.paperId);
    },

    async addQuestionToSection(paperId, sectionId, questionId) {
      const section = await findTenantSection(
        database,
        tenant,
        paperId,
        sectionId,
      );

      if (!section) {
        throw new Error(`Paper section ${sectionId} was not found.`);
      }

      const question = await findTenantQuestion(database, tenant, questionId);

      if (!question) {
        throw new Error(`Question ${questionId} was not found.`);
      }

      const latestVersion = await getLatestQuestionVersion(
        database,
        question.id,
      );

      if (!latestVersion) {
        throw new Error(`Question ${questionId} does not have a version.`);
      }

      const order = (await getNextQuestionOrder(database, section.id)) + 1;
      const now = new Date().toISOString();

      paperQuestionInputSchema.parse({
        questionId: question.id,
        questionVersionId: latestVersion.id,
        order,
      });

      await database.insert(paperQuestions).values({
        id: newId("paper-question"),
        paperSectionId: section.id,
        questionId: question.id,
        questionVersionId: latestVersion.id,
        order,
        updatedAt: now,
      });

      await touchPaper(database, section.paperId, now);
      await writeAuditLog(database, tenant, {
        action: "paper.question.added",
        targetId: section.paperId,
        metadata: {
          sectionId: section.id,
          questionId: question.id,
          questionVersionId: latestVersion.id,
          order,
        },
      });

      return getPaperOrThrow(database, tenant, section.paperId);
    },

    async removeQuestionFromSection(paperId, sectionId, paperQuestionId) {
      const section = await findTenantSection(
        database,
        tenant,
        paperId,
        sectionId,
      );

      if (!section) {
        throw new Error(`Paper section ${sectionId} was not found.`);
      }

      const [paperQuestion] = await database
        .select()
        .from(paperQuestions)
        .where(
          and(
            eq(paperQuestions.id, paperQuestionId),
            eq(paperQuestions.paperSectionId, section.id),
          ),
        )
        .limit(1);

      if (!paperQuestion) {
        throw new Error(`Paper question ${paperQuestionId} was not found.`);
      }

      await database
        .delete(paperQuestions)
        .where(eq(paperQuestions.id, paperQuestion.id));
      await normalizeQuestionOrders(database, section.id);

      const now = new Date().toISOString();
      await touchPaper(database, section.paperId, now);
      await writeAuditLog(database, tenant, {
        action: "paper.question.removed",
        targetId: section.paperId,
        metadata: {
          sectionId: section.id,
          paperQuestionId: paperQuestion.id,
          questionId: paperQuestion.questionId,
        },
      });

      return getPaperOrThrow(database, tenant, section.paperId);
    },

    async moveQuestionInSection(
      paperId,
      sectionId,
      paperQuestionId,
      direction,
    ) {
      const section = await findTenantSection(
        database,
        tenant,
        paperId,
        sectionId,
      );

      if (!section) {
        throw new Error(`Paper section ${sectionId} was not found.`);
      }

      const rows = await database
        .select()
        .from(paperQuestions)
        .where(eq(paperQuestions.paperSectionId, section.id))
        .orderBy(paperQuestions.order);
      const currentIndex = rows.findIndex((row) => row.id === paperQuestionId);
      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= rows.length) {
        return getPaperOrThrow(database, tenant, section.paperId);
      }

      const current = rows[currentIndex];
      const target = rows[targetIndex];

      if (!current || !target) {
        return getPaperOrThrow(database, tenant, section.paperId);
      }

      await database
        .update(paperQuestions)
        .set({ order: -1 })
        .where(eq(paperQuestions.id, current.id));
      await database
        .update(paperQuestions)
        .set({ order: current.order })
        .where(eq(paperQuestions.id, target.id));
      await database
        .update(paperQuestions)
        .set({ order: target.order, updatedAt: new Date().toISOString() })
        .where(eq(paperQuestions.id, current.id));

      const now = new Date().toISOString();
      await touchPaper(database, section.paperId, now);
      await writeAuditLog(database, tenant, {
        action: "paper.question.reordered",
        targetId: section.paperId,
        metadata: {
          sectionId: section.id,
          paperQuestionId: current.id,
          direction,
        },
      });

      return getPaperOrThrow(database, tenant, section.paperId);
    },
  };
}

export const drizzlePaperRepository = createDrizzlePaperRepository();

async function parsePaperCreate(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  input: PaperCreateInput,
) {
  const boundary = paperCreateBoundarySchema.parse(input);
  const subject = await ensureSubject(database, tenant, boundary.subjectName);
  const grade = await ensureGrade(database, tenant, boundary.gradeName);
  const templateVersionId =
    boundary.templateVersionId ??
    (await getDefaultTemplateVersionId(database, tenant));

  paperInputSchema.parse({
    schoolId: tenant.schoolId,
    workspaceId: tenant.workspaceId,
    subjectId: subject.id,
    gradeId: grade.id,
    templateVersionId,
    title: boundary.title,
    sections: [
      {
        title: "Section A",
        instructions: "Answer all questions.",
        order: 1,
        marks: boundary.totalMarksTarget ?? 0,
      },
    ],
  });

  return {
    ...boundary,
    subjectId: subject.id,
    gradeId: grade.id,
    templateVersionId,
  };
}

async function parsePaperUpdate(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  input: PaperUpdateInput,
) {
  const boundary = paperUpdateBoundarySchema.parse(input);
  const parsedCreate = await parsePaperCreate(database, tenant, {
    ...boundary,
    gradeId: input.gradeId,
    subjectId: input.subjectId,
  });

  return {
    ...parsedCreate,
    status: boundary.status,
  };
}

async function findTenantPaper(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  paperId: string,
) {
  const [paper] = await database
    .select()
    .from(papers)
    .where(
      and(
        eq(papers.id, paperId),
        eq(papers.schoolId, tenant.schoolId),
        eq(papers.workspaceId, tenant.workspaceId),
      ),
    )
    .limit(1);

  return paper;
}

async function getPaperOrThrow(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  paperId: string,
) {
  const paper = await findTenantPaper(database, tenant, paperId);

  if (!paper) {
    throw new Error(`Paper ${paperId} was not found.`);
  }

  return mapPaper(database, paper);
}

async function mapPaper(
  database: DatabaseClient,
  paper: PaperRow,
): Promise<PaperBuilderItem> {
  const [subject] = await database
    .select()
    .from(subjects)
    .where(eq(subjects.id, paper.subjectId))
    .limit(1);
  const [grade] = await database
    .select()
    .from(grades)
    .where(eq(grades.id, paper.gradeId))
    .limit(1);
  const sections = await database
    .select()
    .from(paperSections)
    .where(eq(paperSections.paperId, paper.id))
    .orderBy(paperSections.order);
  const templateName = paper.templateVersionId
    ? await getTemplateName(database, paper.templateVersionId)
    : undefined;

  return {
    id: paper.id,
    schoolId: paper.schoolId,
    workspaceId: paper.workspaceId,
    title: paper.title,
    gradeId: paper.gradeId,
    gradeName: grade?.name ?? "Unknown grade",
    subjectId: paper.subjectId,
    subjectName: subject?.name ?? "Unknown subject",
    templateVersionId: paper.templateVersionId ?? undefined,
    templateName,
    durationMinutes: paper.durationMinutes ?? 0,
    totalMarksTarget: paper.totalMarksTarget ?? undefined,
    status: paper.status,
    sections: await Promise.all(
      sections.map((section) => mapSection(database, section)),
    ),
    updatedAt: normalizeTimestamp(paper.updatedAt),
  };
}

async function mapSection(
  database: DatabaseClient,
  section: PaperSectionRow,
): Promise<PaperSectionItem> {
  const rows = await database
    .select()
    .from(paperQuestions)
    .where(eq(paperQuestions.paperSectionId, section.id))
    .orderBy(paperQuestions.order);

  return {
    id: section.id,
    title: section.title,
    instructions: section.instructions ?? undefined,
    order: section.order,
    expectedMarks: section.marks ?? undefined,
    questions: await Promise.all(
      rows.map((row) => mapPaperQuestion(database, row)),
    ),
  };
}

async function mapPaperQuestion(
  database: DatabaseClient,
  paperQuestion: PaperQuestionRow,
): Promise<PaperQuestionItem> {
  const question = await mapQuestionForPaper(
    database,
    paperQuestion.questionId,
    paperQuestion.questionVersionId,
  );

  return {
    id: paperQuestion.id,
    question,
    order: paperQuestion.order,
    marks: paperQuestion.marksOverride ?? question.marks,
  };
}

async function mapQuestionForPaper(
  database: DatabaseClient,
  questionId: string,
  questionVersionId: string,
): Promise<QuestionRepositoryItem> {
  const question = await findQuestionById(database, questionId);

  if (!question) {
    throw new Error(`Question ${questionId} was not found.`);
  }

  const [version] = await database
    .select()
    .from(questionVersions)
    .where(eq(questionVersions.id, questionVersionId))
    .limit(1);
  const [source] = await database
    .select()
    .from(questionSources)
    .where(eq(questionSources.id, question.sourceId))
    .limit(1);
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

  if (!source) {
    throw new Error(`Question source ${question.sourceId} was not found.`);
  }

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
    prompt: version?.promptSnapshot ?? question.prompt,
    marks: question.marks,
    difficulty: question.difficulty ?? undefined,
    status: question.status,
    source: questionSourceInputSchema.parse({
      sourceType: source.sourceType,
      title: source.title,
      author: source.author ?? undefined,
      owner: source.owner ?? undefined,
      license: source.license ?? undefined,
      rightsStatus: source.rightsStatus,
      usageRights: source.usageRights,
      attributionText: source.attributionText ?? undefined,
      originalUrl: source.originalUrl ?? undefined,
    }),
    answerKey: await getPinnedAnswerKey(
      database,
      question.id,
      questionVersionId,
    ),
    versionNumber: version?.versionNumber ?? 1,
    updatedAt: normalizeTimestamp(question.updatedAt),
  };
}

async function getPinnedAnswerKey(
  database: DatabaseClient,
  questionId: string,
  questionVersionId: string,
): Promise<QuestionRepositoryAnswerKey> {
  const [row] = await database
    .select()
    .from(answerKeys)
    .where(eq(answerKeys.questionVersionId, questionVersionId))
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

async function findTenantQuestion(
  database: DatabaseClient,
  tenant: DemoTenantContext,
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

async function findQuestionById(database: DatabaseClient, questionId: string) {
  const [question] = await database
    .select()
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1);

  return question;
}

async function getLatestQuestionVersion(
  database: DatabaseClient,
  questionId: string,
) {
  const [version] = await database
    .select()
    .from(questionVersions)
    .where(eq(questionVersions.questionId, questionId))
    .orderBy(desc(questionVersions.versionNumber))
    .limit(1);

  return version;
}

async function findTenantSection(
  database: DatabaseClient,
  tenant: DemoTenantContext,
  paperId: string,
  sectionId: string,
) {
  const paper = await findTenantPaper(database, tenant, paperId);

  if (!paper) {
    return undefined;
  }

  const [section] = await database
    .select()
    .from(paperSections)
    .where(
      and(eq(paperSections.id, sectionId), eq(paperSections.paperId, paper.id)),
    )
    .limit(1);

  return section;
}

async function ensureSubject(
  database: DatabaseClient,
  tenant: DemoTenantContext,
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
  tenant: DemoTenantContext,
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

  const latestVersion = await getLatestTemplateVersion(database, template.id);
  return latestVersion?.id;
}

async function getLatestTemplateVersion(
  database: DatabaseClient,
  templateId: string,
) {
  const [version] = await database
    .select()
    .from(templateVersions)
    .where(eq(templateVersions.templateId, templateId))
    .orderBy(desc(templateVersions.versionNumber))
    .limit(1);

  return version;
}

async function getTemplateName(
  database: DatabaseClient,
  templateVersionId: string,
) {
  const [version] = await database
    .select()
    .from(templateVersions)
    .where(eq(templateVersions.id, templateVersionId))
    .limit(1);

  if (!version) {
    return undefined;
  }

  const [template] = await database
    .select()
    .from(templates)
    .where(eq(templates.id, version.templateId))
    .limit(1);

  return template?.name;
}

async function getNextSectionOrder(database: DatabaseClient, paperId: string) {
  const rows = await database
    .select()
    .from(paperSections)
    .where(eq(paperSections.paperId, paperId));

  return Math.max(0, ...rows.map((row) => row.order));
}

async function getNextQuestionOrder(
  database: DatabaseClient,
  sectionId: string,
) {
  const rows = await database
    .select()
    .from(paperQuestions)
    .where(eq(paperQuestions.paperSectionId, sectionId));

  return Math.max(0, ...rows.map((row) => row.order));
}

async function moveSectionToOrder(
  database: DatabaseClient,
  section: PaperSectionRow,
  nextOrder: number,
) {
  const rows = await database
    .select()
    .from(paperSections)
    .where(eq(paperSections.paperId, section.paperId))
    .orderBy(paperSections.order);
  const moved = rows.find((row) => row.id === section.id);

  if (!moved) {
    return;
  }

  const withoutMoved = rows.filter((row) => row.id !== moved.id);
  withoutMoved.splice(Math.max(0, nextOrder - 1), 0, moved);

  for (const [index, row] of withoutMoved.entries()) {
    await database
      .update(paperSections)
      .set({ order: -(index + 1) })
      .where(eq(paperSections.id, row.id));
  }

  for (const [index, row] of withoutMoved.entries()) {
    await database
      .update(paperSections)
      .set({ order: index + 1 })
      .where(eq(paperSections.id, row.id));
  }
}

async function normalizeQuestionOrders(
  database: DatabaseClient,
  sectionId: string,
) {
  const rows = await database
    .select()
    .from(paperQuestions)
    .where(eq(paperQuestions.paperSectionId, sectionId))
    .orderBy(paperQuestions.order);

  for (const [index, row] of rows.entries()) {
    await database
      .update(paperQuestions)
      .set({ order: index + 1 })
      .where(eq(paperQuestions.id, row.id));
  }
}

async function touchPaper(
  database: DatabaseClient,
  paperId: string,
  timestamp: string,
) {
  await database
    .update(papers)
    .set({ updatedAt: timestamp })
    .where(eq(papers.id, paperId));
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
    targetType: "PAPER",
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
