import { readFileSync } from "node:fs";
import { join } from "node:path";

import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import {
  auditLogs,
  paperQuestions,
  schools,
  templateVersions,
  templates,
  users,
  workspaces,
} from "@/db/schema";
import { createDrizzlePaperRepository } from "@/lib/papers/drizzle-paper-repository";
import type { PaperBuilderItem } from "@/lib/papers/types";
import { createDrizzleQuestionRepository } from "@/lib/questions/drizzle-question-repository";
import type { QuestionRepositoryFormValues } from "@/lib/questions/types";

const tenant = {
  schoolId: "school-test",
  workspaceId: "workspace-test",
  actorId: "user-test",
} as const;

describe("drizzle paper repository", () => {
  it("creates, updates, and archives persisted papers", async () => {
    const { db, repository, sqlite } = createTestRepository();

    try {
      const created = await repository.createPaper(makePaperInput());
      const updated = await repository.updatePaper(created.id, {
        ...toUpdateInput(created),
        title: "Updated Algebra Checkpoint",
        durationMinutes: 60,
        status: "VALIDATING",
      });
      const archived = await repository.archivePaper(created.id);
      const auditRows = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.targetId, created.id));

      expect(created.sections).toHaveLength(1);
      expect(created.templateVersionId).toBe("template-version-test-v1");
      expect(updated.title).toBe("Updated Algebra Checkpoint");
      expect(updated.durationMinutes).toBe(60);
      expect(archived.status).toBe("ARCHIVED");
      expect(auditRows.map((row) => row.action)).toEqual(
        expect.arrayContaining([
          "paper.created",
          "paper.updated",
          "paper.archived",
        ]),
      );
    } finally {
      sqlite.close();
    }
  });

  it("creates and edits persisted paper sections", async () => {
    const { repository, sqlite } = createTestRepository();

    try {
      const created = await repository.createPaper(makePaperInput());
      const withSection = await repository.createSection(created.id, {
        title: "Section B",
        instructions: "Long answers.",
        expectedMarks: 20,
      });
      const section = withSection.sections.find(
        (item) => item.title === "Section B",
      );

      expect(section).toBeDefined();

      const updated = await repository.updateSection(
        created.id,
        section?.id ?? "",
        {
          title: "Section B: Reasoning",
          instructions: "Show working.",
          expectedMarks: 25,
          order: 1,
        },
      );

      expect(updated.sections[0]?.title).toBe("Section B: Reasoning");
      expect(updated.sections[0]?.expectedMarks).toBe(25);
    } finally {
      sqlite.close();
    }
  });

  it("adds, reorders, and removes persisted paper questions", async () => {
    const { db, questionRepository, repository, sqlite } =
      createTestRepository();

    try {
      const firstQuestion = await questionRepository.createQuestion(
        makeQuestionInput("Solve 2x = 10.", "x = 5"),
      );
      const secondQuestion = await questionRepository.createQuestion(
        makeQuestionInput("Solve x + 3 = 9.", "x = 6"),
      );
      const paper = await repository.createPaper(makePaperInput());
      const sectionId = paper.sections[0]?.id ?? "";
      const withFirst = await repository.addQuestionToSection(
        paper.id,
        sectionId,
        firstQuestion.id,
      );
      const withSecond = await repository.addQuestionToSection(
        paper.id,
        sectionId,
        secondQuestion.id,
      );
      const secondPaperQuestion =
        withSecond.sections[0]?.questions.find(
          (paperQuestion) => paperQuestion.question.id === secondQuestion.id,
        ) ?? withFirst.sections[0]?.questions[0];

      const reordered = await repository.moveQuestionInSection(
        paper.id,
        sectionId,
        secondPaperQuestion?.id ?? "",
        "up",
      );
      const removed = await repository.removeQuestionFromSection(
        paper.id,
        sectionId,
        secondPaperQuestion?.id ?? "",
      );
      const rows = await db
        .select()
        .from(paperQuestions)
        .where(eq(paperQuestions.paperSectionId, sectionId));

      expect(withSecond.sections[0]?.questions).toHaveLength(2);
      expect(reordered.sections[0]?.questions[0]?.question.id).toBe(
        secondQuestion.id,
      );
      expect(removed.sections[0]?.questions).toHaveLength(1);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.questionVersionId).toBeTruthy();
    } finally {
      sqlite.close();
    }
  });
});

function createTestRepository() {
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
  db.insert(templates)
    .values({
      id: "template-test",
      schoolId: tenant.schoolId,
      workspaceId: tenant.workspaceId,
      createdById: tenant.actorId,
      name: "Test Exam Template",
      type: "EXAM",
      status: "ACTIVE",
    })
    .run();
  db.insert(templateVersions)
    .values({
      id: "template-version-test-v1",
      templateId: "template-test",
      versionNumber: 1,
      structure: {
        schoolName: "Test School",
      },
    })
    .run();

  return {
    db,
    questionRepository: createDrizzleQuestionRepository(db, tenant),
    repository: createDrizzlePaperRepository(db, tenant),
    sqlite,
  };
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

function makePaperInput() {
  return {
    title: "Grade 8 Algebra Checkpoint",
    gradeId: "grade-8",
    gradeName: "Grade 8",
    subjectId: "subject-math",
    subjectName: "Mathematics",
    durationMinutes: 45,
    totalMarksTarget: 20,
  };
}

function makeQuestionInput(
  prompt: string,
  answer: string,
): QuestionRepositoryFormValues {
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
    prompt,
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
      answer,
      explanation: "Standard algebra solving steps.",
      isComplete: true,
    },
  };
}

function toUpdateInput(paper: PaperBuilderItem) {
  return {
    title: paper.title,
    gradeId: paper.gradeId,
    gradeName: paper.gradeName,
    subjectId: paper.subjectId,
    subjectName: paper.subjectName,
    durationMinutes: paper.durationMinutes,
    totalMarksTarget: paper.totalMarksTarget,
    templateVersionId: paper.templateVersionId,
    status: paper.status,
  };
}
