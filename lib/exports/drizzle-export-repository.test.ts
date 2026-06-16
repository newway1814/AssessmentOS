import { readFileSync } from "node:fs";
import { join } from "node:path";

import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import {
  auditLogs,
  exportRequests,
  schools,
  users,
  workspaces,
} from "@/db/schema";
import { createDrizzleExportRepository } from "@/lib/exports/repository";
import { createDrizzlePaperRepository } from "@/lib/papers/drizzle-paper-repository";
import { createDrizzleQuestionRepository } from "@/lib/questions/drizzle-question-repository";
import type { QuestionRepositoryFormValues } from "@/lib/questions/types";
import { createDrizzleTemplateRepository } from "@/lib/templates/drizzle-template-repository";
import type { SchoolTemplateFormValues } from "@/lib/templates/types";

const tenant = {
  schoolId: "school-test",
  workspaceId: "workspace-test",
  actorId: "user-test",
} as const;

describe("drizzle export repository", () => {
  it("creates persisted export requests from real paper and template data", async () => {
    const {
      db,
      exportRepository,
      paperRepository,
      questionRepository,
      sqlite,
    } = await createTestRepository();

    try {
      const { paperId } = await createPaperFixture({
        paperRepository,
        questionRepository,
      });
      const request = await exportRepository.createExportRequest({
        paperId,
        format: "PDF",
        copyType: "TEACHER",
        answerKeyVisible: true,
        previewMode: "ASSESSMENT",
      });
      const [row] = await db
        .select()
        .from(exportRequests)
        .where(eq(exportRequests.id, request.id))
        .limit(1);

      expect(request.paperTitle).toBe("Grade 8 Algebra Checkpoint");
      expect(request.templateName).toBe("Standard Exam Template");
      expect(request.format).toBe("PDF");
      expect(request.copyType).toBe("TEACHER");
      expect(request.answerKeyVisible).toBe(true);
      expect(request.checklist.length).toBeGreaterThan(0);
      expect(row?.paperId).toBe(paperId);
    } finally {
      sqlite.close();
    }
  });

  it("persists preview state and placeholder export status changes", async () => {
    const {
      db,
      exportRepository,
      paperRepository,
      questionRepository,
      sqlite,
    } = await createTestRepository();

    try {
      const { paperId } = await createPaperFixture({
        paperRepository,
        questionRepository,
      });
      const assignmentPreview = await exportRepository.updatePreviewState(
        paperId,
        {
          copyType: "ASSIGNMENT",
          answerKeyVisible: false,
          previewMode: "ASSIGNMENT",
        },
      );
      const placeholderPreview = await exportRepository.updateExportStatus(
        paperId,
        {
          format: "DOCX",
          status: "GENERATED_PLACEHOLDER",
        },
      );
      const auditRows = await db.select().from(auditLogs);

      expect(assignmentPreview.state.copyType).toBe("ASSIGNMENT");
      expect(assignmentPreview.state.previewMode).toBe("ASSIGNMENT");
      expect(placeholderPreview.state.request?.format).toBe("DOCX");
      expect(placeholderPreview.state.request?.status).toBe(
        "GENERATED_PLACEHOLDER",
      );
      expect(auditRows.map((row) => row.action)).toEqual(
        expect.arrayContaining(["export.created", "export.updated"]),
      );
    } finally {
      sqlite.close();
    }
  });
});

async function createTestRepository() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  runMigration(sqlite);

  const db = drizzle(sqlite, { schema });

  db.insert(schools)
    .values({
      id: tenant.schoolId,
      name: "Test School",
      slug: "test-school",
    })
    .run();
  db.insert(workspaces)
    .values({
      id: tenant.workspaceId,
      schoolId: tenant.schoolId,
      name: "Assessment workspace",
    })
    .run();
  db.insert(users)
    .values({
      id: tenant.actorId,
      name: "Test Teacher",
      email: "teacher@example.test",
    })
    .run();

  await createDrizzleTemplateRepository(db, tenant).createTemplate(
    makeTemplateInput(),
  );

  return {
    db,
    exportRepository: createDrizzleExportRepository(db, tenant),
    paperRepository: createDrizzlePaperRepository(db, tenant),
    questionRepository: createDrizzleQuestionRepository(db, tenant),
    sqlite,
  };
}

async function createPaperFixture({
  paperRepository,
  questionRepository,
}: {
  paperRepository: ReturnType<typeof createDrizzlePaperRepository>;
  questionRepository: ReturnType<typeof createDrizzleQuestionRepository>;
}) {
  const question = await questionRepository.createQuestion(makeQuestionInput());
  const paper = await paperRepository.createPaper({
    title: "Grade 8 Algebra Checkpoint",
    gradeId: "grade-8",
    gradeName: "Grade 8",
    subjectId: "subject-math",
    subjectName: "Mathematics",
    durationMinutes: 45,
    totalMarksTarget: 2,
  });
  const sectionId = paper.sections[0]?.id;

  if (!sectionId) {
    throw new Error("Expected default paper section.");
  }

  await paperRepository.addQuestionToSection(paper.id, sectionId, question.id);

  return { paperId: paper.id };
}

function runMigration(sqlite: Database.Database) {
  const migration = readFileSync(
    join(process.cwd(), "drizzle", "0000_real_vin_gonzales.sql"),
    "utf8",
  );

  for (const statement of migration.split("--> statement-breakpoint")) {
    const trimmedStatement = statement.trim();

    if (trimmedStatement) {
      sqlite.exec(trimmedStatement);
    }
  }
}

function makeTemplateInput(): SchoolTemplateFormValues {
  return {
    name: "Standard Exam Template",
    type: "EXAM",
    schoolName: "Test School",
    logoUrl: "",
    headerText: "Mid-Term Assessment",
    footerText: "Internal use only.",
    examInstructions: "Answer all questions.",
    studentMetadataFields: ["Name", "Roll number", "Class", "Date"],
    defaultDurationMinutes: 45,
    defaultTotalMarks: 2,
    sectionPattern: [
      {
        title: "Section A",
        instructions: "Answer all.",
        expectedMarks: 2,
      },
    ],
    pageRuleNotes: "A4 layout.",
    status: "ACTIVE",
  };
}

function makeQuestionInput(): QuestionRepositoryFormValues {
  return {
    subjectId: "subject-math",
    subjectName: "Mathematics",
    gradeId: "grade-8",
    gradeName: "Grade 8",
    chapterId: "chapter-linear-equations",
    chapterName: "Linear Equations",
    subtopicId: "subtopic-one-variable",
    subtopicName: "Solving one-variable equations",
    type: "SHORT_ANSWER",
    prompt: "Solve for x: 3x + 5 = 20.",
    marks: 2,
    difficulty: "Foundational",
    source: {
      sourceType: "TEACHER_CREATED",
      title: "Teacher-authored algebra set",
      author: "Test Teacher",
      owner: "Test School",
      rightsStatus: "VERIFIED",
      usageRights: "Teacher-created content for internal assessment use.",
    },
    answerKey: {
      answer: "x = 5",
      explanation: "3x = 15, therefore x = 5.",
      isComplete: true,
    },
  };
}
