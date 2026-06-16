import { readFileSync } from "node:fs";
import { join } from "node:path";

import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import {
  answerKeys,
  questionVersions,
  schools,
  users,
  workspaces,
} from "@/db/schema";
import { createDrizzleQuestionRepository } from "@/lib/questions/drizzle-question-repository";
import type {
  QuestionRepositoryFormValues,
  QuestionRepositoryItem,
} from "@/lib/questions/types";

const tenant = {
  schoolId: "school-test",
  workspaceId: "workspace-test",
  actorId: "user-test",
} as const;

describe("drizzle question repository", () => {
  it("creates a persisted question with source, rights, answer key, and version metadata", async () => {
    const { db, repository, sqlite } = createTestRepository();

    try {
      const question = await repository.createQuestion(makeQuestionInput());
      const answerKeyRows = await db
        .select()
        .from(answerKeys)
        .where(eq(answerKeys.questionId, question.id));
      const versionRows = await db
        .select()
        .from(questionVersions)
        .where(eq(questionVersions.questionId, question.id));

      expect(question.prompt).toBe("Solve for x: 2x + 8 = 18.");
      expect(question.source.rightsStatus).toBe("VERIFIED");
      expect(question.answerKey.answer).toBe("x = 5");
      expect(question.versionNumber).toBe(1);
      expect(answerKeyRows).toHaveLength(1);
      expect(versionRows).toHaveLength(1);
    } finally {
      sqlite.close();
    }
  });

  it("lists, edits, and archives tenant-scoped questions", async () => {
    const { db, repository, sqlite } = createTestRepository();

    try {
      const created = await repository.createQuestion(makeQuestionInput());
      const edited = await repository.updateQuestion(created.id, {
        ...formValuesFromQuestion(created),
        prompt: "Solve for x and show working: 2x + 8 = 18.",
        answerKey: {
          answer: "x = 5",
          explanation: "2x = 10, therefore x = 5.",
          isComplete: true,
        },
      });
      const archived = await repository.archiveQuestion(created.id);
      const listed = await repository.listQuestions();
      const versionRows = await db
        .select()
        .from(questionVersions)
        .where(eq(questionVersions.questionId, created.id));

      expect(edited.versionNumber).toBe(2);
      expect(edited.prompt).toContain("show working");
      expect(archived.status).toBe("ARCHIVED");
      expect(listed.map((question) => question.id)).toContain(created.id);
      expect(versionRows).toHaveLength(2);
    } finally {
      sqlite.close();
    }
  });

  it("rejects invalid source metadata at the repository boundary", async () => {
    const { repository, sqlite } = createTestRepository();

    try {
      await expect(
        repository.createQuestion({
          ...makeQuestionInput(),
          source: {
            ...makeQuestionInput().source,
            title: "",
          },
        }),
      ).rejects.toThrow();
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

  return {
    db,
    repository: createDrizzleQuestionRepository(db, tenant),
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
    prompt: "Solve for x: 2x + 8 = 18.",
    marks: 2,
    difficulty: "Foundational",
    source: {
      sourceType: "TEACHER_CREATED",
      title: "Teacher-authored Grade 8 algebra set",
      author: "Test Teacher",
      owner: "Test School",
      rightsStatus: "VERIFIED",
      usageRights: "Teacher-created content for internal assessment use.",
    },
    answerKey: {
      answer: "x = 5",
      explanation: "2x = 10, therefore x = 5.",
      isComplete: true,
    },
  };
}

function formValuesFromQuestion(
  question: QuestionRepositoryItem,
): QuestionRepositoryFormValues {
  return {
    subjectId: question.subjectId,
    subjectName: question.subjectName,
    gradeId: question.gradeId,
    gradeName: question.gradeName,
    chapterId: question.chapterId,
    chapterName: question.chapterName,
    subtopicId: question.subtopicId,
    subtopicName: question.subtopicName,
    type: question.type,
    prompt: question.prompt,
    marks: question.marks,
    difficulty: question.difficulty,
    source: question.source,
    answerKey: question.answerKey,
  };
}
