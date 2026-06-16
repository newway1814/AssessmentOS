import { readFileSync } from "node:fs";
import { join } from "node:path";

import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import {
  auditLogs,
  importCandidates,
  questions,
  schools,
  users,
  workspaces,
} from "@/db/schema";
import { createDrizzleImportRepository } from "@/lib/imports/drizzle-import-repository";
import type { NormalizedQuestionCard } from "@/lib/imports/types";

const tenant = {
  schoolId: "school-test",
  workspaceId: "workspace-test",
  actorId: "user-test",
} as const;

describe("drizzle import repository", () => {
  it("creates persisted import batches with mock normalized candidates", async () => {
    const { db, repository, sqlite } = createTestRepository();

    try {
      const created = await repository.createMockImport(makeImportDraft());
      const auditRows = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.targetId, created.id));

      expect(created.status).toBe("NEEDS_REVIEW");
      expect(created.normalizedQuestions).toHaveLength(2);
      expect(created.normalizedQuestions[0]?.usageRights).toBeTruthy();
      expect(auditRows.map((row) => row.action)).toContain("import.created");
    } finally {
      sqlite.close();
    }
  });

  it("edits and rejects persisted import candidates", async () => {
    const { db, repository, sqlite } = createTestRepository();

    try {
      const created = await repository.createMockImport(makeImportDraft());
      const candidate = created.normalizedQuestions[0];

      if (!candidate) {
        throw new Error("Expected a normalized import candidate.");
      }

      const updated = await repository.updateCandidate(
        created.id,
        candidate.id,
        {
          ...candidateInput(candidate),
          prompt: "Updated imported question prompt.",
          marks: 6,
          usageRights: "Updated school-owned usage rights.",
        },
      );
      const rejected = await repository.rejectCandidate(
        created.id,
        candidate.id,
      );
      const [row] = await db
        .select()
        .from(importCandidates)
        .where(eq(importCandidates.id, candidate.id))
        .limit(1);

      expect(updated.normalizedQuestions[0]?.prompt).toBe(
        "Updated imported question prompt.",
      );
      expect(rejected.normalizedQuestions[0]?.status).toBe("REJECTED");
      expect(row?.usageRights).toBe("Updated school-owned usage rights.");
    } finally {
      sqlite.close();
    }
  });

  it("approves candidates into persisted repository questions", async () => {
    const { db, repository, sqlite } = createTestRepository();

    try {
      const created = await repository.createMockImport(makeImportDraft());
      const candidate = created.normalizedQuestions[0];

      if (!candidate) {
        throw new Error("Expected a normalized import candidate.");
      }

      const approved = await repository.approveCandidate(
        created.id,
        candidate.id,
      );
      const approvedCandidate = approved.normalizedQuestions.find(
        (item) => item.id === candidate.id,
      );
      const questionRows = await db.select().from(questions);

      expect(approvedCandidate?.status).toBe("APPROVED");
      expect(approvedCandidate?.approvedQuestionId).toBeTruthy();
      expect(questionRows).toHaveLength(1);
      expect(questionRows[0]?.prompt).toBe(candidate?.prompt);
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
    repository: createDrizzleImportRepository(db, tenant),
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

function makeImportDraft() {
  return {
    sourceOption: "PASTED_TEXT" as const,
    pastedText: "Find the value of x in 2x + 4 = 10.",
    fileName: "",
    sourceTitle: "Teacher algebra paste",
    sourceReference: "Teacher-created worksheet",
    sourceType: "TEACHER_CREATED" as const,
    rightsStatus: "VERIFIED" as const,
  };
}

function candidateInput(candidate: NormalizedQuestionCard) {
  return {
    prompt: candidate.prompt,
    gradeName: candidate.gradeName,
    subjectName: candidate.subjectName,
    chapterName: candidate.chapterName,
    subtopicName: candidate.subtopicName,
    marks: candidate.marks,
    difficulty: candidate.difficulty,
    type: candidate.type,
    answerKey: candidate.answerKey,
    sourceType: candidate.sourceType,
    rightsStatus: candidate.rightsStatus,
    sourceTitle: candidate.sourceTitle,
    sourceReference: candidate.sourceReference,
    usageRights: candidate.usageRights,
  };
}
