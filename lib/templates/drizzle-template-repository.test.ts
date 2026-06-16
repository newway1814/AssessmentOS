import { readFileSync } from "node:fs";
import { join } from "node:path";

import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import {
  auditLogs,
  schools,
  templateVersions,
  users,
  workspaces,
} from "@/db/schema";
import { createDrizzleTemplateRepository } from "@/lib/templates/drizzle-template-repository";
import type {
  SchoolTemplateFormValues,
  SchoolTemplateItem,
} from "@/lib/templates/types";

const tenant = {
  schoolId: "school-test",
  workspaceId: "workspace-test",
  actorId: "user-test",
} as const;

describe("drizzle template repository", () => {
  it("creates a persisted template with first version and audit log", async () => {
    const { db, repository, sqlite } = createTestRepository();

    try {
      const template = await repository.createTemplate(makeTemplateInput());
      const versionRows = await db
        .select()
        .from(templateVersions)
        .where(eq(templateVersions.templateId, template.id));
      const auditRows = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.targetId, template.id));

      expect(template.name).toBe("Standard Exam Template");
      expect(template.schoolName).toBe("Test School");
      expect(template.versionNumber).toBe(1);
      expect(template.sectionPattern).toHaveLength(2);
      expect(versionRows).toHaveLength(1);
      expect(auditRows[0]?.action).toBe("template.created");
    } finally {
      sqlite.close();
    }
  });

  it("lists, edits, and archives tenant-scoped templates", async () => {
    const { db, repository, sqlite } = createTestRepository();

    try {
      const created = await repository.createTemplate(makeTemplateInput());
      const edited = await repository.updateTemplate(created.id, {
        ...formValuesFromTemplate(created),
        headerText: "Revised End of Term Assessment",
        defaultDurationMinutes: 75,
      });
      const archived = await repository.archiveTemplate(created.id);
      const listed = await repository.listTemplates();
      const versionRows = await db
        .select()
        .from(templateVersions)
        .where(eq(templateVersions.templateId, created.id));

      expect(edited.versionNumber).toBe(2);
      expect(edited.headerText).toBe("Revised End of Term Assessment");
      expect(edited.defaultDurationMinutes).toBe(75);
      expect(archived.status).toBe("ARCHIVED");
      expect(listed.map((template) => template.id)).toContain(created.id);
      expect(versionRows).toHaveLength(2);
    } finally {
      sqlite.close();
    }
  });

  it("maps legacy seed-like template structure into preview-ready fields", async () => {
    const { repository, sqlite } = createTestRepository();

    try {
      const template = await repository.createTemplate(makeTemplateInput());
      await repository.updateTemplate(template.id, {
        ...formValuesFromTemplate(template),
        studentMetadataFields: ["Name", "Roll number"],
      });

      const loaded = await repository.getTemplate(template.id);

      expect(loaded?.studentMetadataFields).toEqual(["Name", "Roll number"]);
      expect(loaded?.defaultTotalMarks).toBe(50);
    } finally {
      sqlite.close();
    }
  });

  it("rejects invalid template settings at the repository boundary", async () => {
    const { repository, sqlite } = createTestRepository();

    try {
      await expect(
        repository.createTemplate({
          ...makeTemplateInput(),
          name: "",
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
      name: "Test Coordinator",
      email: "coordinator@example.test",
    })
    .run();

  return {
    db,
    repository: createDrizzleTemplateRepository(db, tenant),
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

function makeTemplateInput(): SchoolTemplateFormValues {
  return {
    name: "Standard Exam Template",
    type: "EXAM",
    schoolName: "Test School",
    logoUrl: "",
    headerText: "End of Term Assessment",
    footerText: "Internal school use only.",
    examInstructions: "Answer all questions and show working.",
    studentMetadataFields: ["Name", "Roll number", "Class", "Section", "Date"],
    defaultDurationMinutes: 90,
    defaultTotalMarks: 50,
    sectionPattern: [
      {
        title: "Section A",
        instructions: "Short-answer questions.",
        expectedMarks: 20,
      },
      {
        title: "Section B",
        instructions: "Long-answer questions.",
        expectedMarks: 30,
      },
    ],
    pageRuleNotes: "A4 layout with school header and page numbers.",
    status: "ACTIVE",
  };
}

function formValuesFromTemplate(
  template: SchoolTemplateItem,
): SchoolTemplateFormValues {
  return {
    name: template.name,
    type: template.type,
    schoolName: template.schoolName,
    logoUrl: template.logoUrl,
    headerText: template.headerText,
    footerText: template.footerText,
    examInstructions: template.examInstructions,
    studentMetadataFields: template.studentMetadataFields,
    defaultDurationMinutes: template.defaultDurationMinutes,
    defaultTotalMarks: template.defaultTotalMarks,
    sectionPattern: template.sectionPattern,
    pageRuleNotes: template.pageRuleNotes,
    status: template.status,
  };
}
