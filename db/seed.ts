import "dotenv/config";

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import {
  answerKeys,
  auditLogs,
  chapters,
  exportRequests,
  grades,
  importBatches,
  importCandidates,
  paperQuestions,
  paperSections,
  papers,
  questionSources,
  questionVersions,
  questions,
  roles,
  schools,
  subjects,
  subtopics,
  templateVersions,
  templates,
  users,
  validationResults,
  workspaces,
} from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "./data/assessmentos.sqlite";

mkdirSync(dirname(databaseUrl), { recursive: true });

const sqlite = new Database(databaseUrl);
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite);

async function seed() {
  await db
    .insert(schools)
    .values({
      id: "school-riverside",
      name: "Riverside International School",
      slug: "riverside",
    })
    .onConflictDoNothing();

  await db
    .insert(workspaces)
    .values({
      id: "workspace-academic-coordination",
      schoolId: "school-riverside",
      name: "Academic coordination",
    })
    .onConflictDoNothing();

  await db
    .insert(users)
    .values([
      {
        id: "user-maya",
        name: "Maya Rao",
        email: "maya.rao@riverside.example",
      },
      {
        id: "user-arjun",
        name: "Arjun Mehta",
        email: "arjun.mehta@riverside.example",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(roles)
    .values([
      {
        id: "role-maya-teacher",
        schoolId: "school-riverside",
        workspaceId: "workspace-academic-coordination",
        userId: "user-maya",
        name: "TEACHER",
      },
      {
        id: "role-arjun-coordinator",
        schoolId: "school-riverside",
        workspaceId: "workspace-academic-coordination",
        userId: "user-arjun",
        name: "ACADEMIC_COORDINATOR",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(subjects)
    .values({
      id: "subject-math",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      name: "Mathematics",
      code: "MATH",
    })
    .onConflictDoNothing();

  await db
    .insert(grades)
    .values({
      id: "grade-8",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      name: "Grade 8",
      order: 8,
    })
    .onConflictDoNothing();

  await db
    .insert(chapters)
    .values({
      id: "chapter-linear-equations",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      subjectId: "subject-math",
      name: "Linear Equations",
      order: 1,
    })
    .onConflictDoNothing();

  await db
    .insert(subtopics)
    .values({
      id: "subtopic-one-variable",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      chapterId: "chapter-linear-equations",
      name: "Solving one-variable equations",
      order: 1,
    })
    .onConflictDoNothing();

  await db
    .insert(questionSources)
    .values({
      id: "source-teacher-algebra",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      createdById: "user-maya",
      sourceType: "TEACHER_CREATED",
      title: "Teacher-authored Grade 8 algebra set",
      author: "Maya Rao",
      owner: "Riverside International School",
      rightsStatus: "VERIFIED",
      usageRights:
        "Teacher-created content for Riverside International School internal assessment use.",
      verifiedAt: "2026-06-16T00:00:00.000Z",
    })
    .onConflictDoNothing();

  await db
    .insert(questions)
    .values({
      id: "question-linear-equations-1",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      sourceId: "source-teacher-algebra",
      subjectId: "subject-math",
      gradeId: "grade-8",
      chapterId: "chapter-linear-equations",
      subtopicId: "subtopic-one-variable",
      createdById: "user-maya",
      type: "SHORT_ANSWER",
      prompt: "Solve for x: 3x + 5 = 20.",
      marks: 2,
      difficulty: "Foundational",
      status: "READY",
    })
    .onConflictDoNothing();

  await db
    .insert(questionVersions)
    .values({
      id: "question-version-linear-equations-1-v1",
      questionId: "question-linear-equations-1",
      editedById: "user-maya",
      versionNumber: 1,
      promptSnapshot: "Solve for x: 3x + 5 = 20.",
      metadataSnapshot: {
        subjectId: "subject-math",
        gradeId: "grade-8",
        chapterId: "chapter-linear-equations",
        subtopicId: "subtopic-one-variable",
        marks: 2,
        difficulty: "Foundational",
        type: "SHORT_ANSWER",
      },
      sourceSnapshot: {
        sourceType: "TEACHER_CREATED",
        rightsStatus: "VERIFIED",
        title: "Teacher-authored Grade 8 algebra set",
      },
      answerKeySnapshot: {
        answer: "x = 5",
        explanation: "3x = 15, therefore x = 5.",
      },
      changeReason: "Initial teacher-authored seed question.",
    })
    .onConflictDoNothing();

  await db
    .insert(answerKeys)
    .values({
      id: "answer-key-linear-equations-1",
      questionId: "question-linear-equations-1",
      questionVersionId: "question-version-linear-equations-1-v1",
      content: {
        answer: "x = 5",
        explanation: "3x = 15, therefore x = 5.",
      },
      isComplete: true,
    })
    .onConflictDoNothing();

  await db
    .insert(templates)
    .values({
      id: "template-riverside-exam",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      createdById: "user-arjun",
      name: "Riverside Exam Paper",
      type: "EXAM",
      status: "ACTIVE",
    })
    .onConflictDoNothing();

  await db
    .insert(templateVersions)
    .values({
      id: "template-version-riverside-exam-v1",
      templateId: "template-riverside-exam",
      versionNumber: 1,
      structure: {
        schoolName: "Riverside International School",
        headerText: "Mid-Term Assessment",
        footerText: "Prepared for internal school use.",
        examInstructions:
          "Write all answers in the spaces provided. Show working for calculation questions.",
        studentMetadataFields: ["Name", "Roll number", "Class", "Date"],
        defaultDurationMinutes: 60,
        defaultTotalMarks: 40,
        sectionPattern: [
          {
            title: "Section A",
            instructions: "Answer all short-answer questions.",
            expectedMarks: 20,
          },
          {
            title: "Section B",
            instructions: "Show working for long-answer questions.",
            expectedMarks: 20,
          },
        ],
        pageRuleNotes:
          "A4 layout, school header on first page, page numbers in footer.",
      },
      changeReason: "Initial approved school exam template.",
    })
    .onConflictDoNothing();

  await db
    .insert(templates)
    .values({
      id: "template-riverside-standard-exam",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      createdById: "user-arjun",
      name: "Riverside Standard Exam Paper",
      type: "EXAM",
      status: "ACTIVE",
    })
    .onConflictDoNothing();

  await db
    .insert(templateVersions)
    .values({
      id: "template-version-riverside-standard-exam-v1",
      templateId: "template-riverside-standard-exam",
      versionNumber: 1,
      structure: {
        schoolName: "Riverside International School",
        logoUrl: "",
        headerText: "End of Term Assessment",
        footerText:
          "This paper is confidential and intended for internal school use.",
        examInstructions:
          "Write all answers in the spaces provided. Show working for calculation questions.",
        studentMetadataFields: [
          "Name",
          "Roll number",
          "Class",
          "Section",
          "Date",
        ],
        defaultDurationMinutes: 90,
        defaultTotalMarks: 50,
        sectionPattern: [
          {
            title: "Section A",
            instructions: "Answer all short-answer questions.",
            expectedMarks: 20,
          },
          {
            title: "Section B",
            instructions: "Answer any three long-answer questions.",
            expectedMarks: 30,
          },
        ],
        pageRuleNotes:
          "A4 layout, school header on first page, page numbers in footer, answer spaces kept with questions.",
      },
      changeReason: "Initial approved standard exam template.",
    })
    .onConflictDoNothing();

  await db
    .insert(papers)
    .values({
      id: "paper-grade-8-algebra-checkpoint",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      subjectId: "subject-math",
      gradeId: "grade-8",
      templateVersionId: "template-version-riverside-exam-v1",
      createdById: "user-maya",
      title: "Grade 8 Algebra Checkpoint",
      durationMinutes: 45,
      totalMarksTarget: 20,
      status: "DRAFT",
    })
    .onConflictDoNothing();

  await db
    .insert(paperSections)
    .values({
      id: "paper-section-algebra-a",
      paperId: "paper-grade-8-algebra-checkpoint",
      title: "Section A",
      instructions: "Answer all questions.",
      order: 1,
      marks: 10,
    })
    .onConflictDoNothing();

  await db
    .insert(paperQuestions)
    .values({
      id: "paper-question-algebra-1",
      paperSectionId: "paper-section-algebra-a",
      questionId: "question-linear-equations-1",
      questionVersionId: "question-version-linear-equations-1-v1",
      order: 1,
    })
    .onConflictDoNothing();

  await db
    .insert(importBatches)
    .values({
      id: "import-grade-8-algebra-paste",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      submittedById: "user-maya",
      title: "Grade 8 algebra worksheet paste",
      sourceOption: "PASTED_TEXT",
      status: "NEEDS_REVIEW",
      rawText: "Solve 3x + 7 = 28. Explain each step.",
      normalizationMetadata: {
        mode: "mock",
        note: "No AI provider called.",
      },
      rightsAcknowledgedAt: "2026-06-16T00:00:00.000Z",
    })
    .onConflictDoNothing();

  await db
    .insert(importCandidates)
    .values({
      id: "import-candidate-algebra-1",
      importBatchId: "import-grade-8-algebra-paste",
      prompt: "Solve 3x + 7 = 28 and show each step.",
      subjectName: "Mathematics",
      gradeName: "Grade 8",
      chapterName: "Linear Equations",
      subtopicName: "Solving one-variable equations",
      type: "SHORT_ANSWER",
      marks: 3,
      difficulty: "Foundational",
      answerKeyDraft: "x = 7",
      sourceType: "TEACHER_CREATED",
      rightsStatus: "VERIFIED",
      sourceTitle: "Grade 8 algebra worksheet paste",
      sourceReference: "Teacher-created worksheet, June 2026",
      usageRights:
        "Teacher-created content for Riverside International School internal assessment use.",
      confidence: 0.91,
      reviewStatus: "NEEDS_REVIEW",
    })
    .onConflictDoNothing();

  await db
    .insert(validationResults)
    .values({
      id: "validation-paper-algebra-total",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      targetType: "PAPER",
      targetId: "paper-grade-8-algebra-checkpoint",
      severity: "WARNING",
      code: "PAPER_TOTAL_MARKS_BELOW_TARGET",
      message: "Paper currently contains fewer marks than the target total.",
      field: "totalMarksTarget",
      suggestedFix: "Add questions or adjust the target marks.",
    })
    .onConflictDoNothing();

  await db
    .insert(exportRequests)
    .values({
      id: "export-request-algebra-preview",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      paperId: "paper-grade-8-algebra-checkpoint",
      templateVersionId: "template-version-riverside-exam-v1",
      requestedById: "user-maya",
      format: "PRINT",
      copyType: "TEACHER",
      status: "PLACEHOLDER",
      readinessSummary: {
        ready: false,
        blockers: ["Paper marks are below target."],
      },
    })
    .onConflictDoNothing();

  await db
    .insert(auditLogs)
    .values({
      id: "audit-seed-question-created",
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      actorId: "user-maya",
      action: "question.created",
      targetType: "QUESTION",
      targetId: "question-linear-equations-1",
      metadata: {
        seed: true,
      },
    })
    .onConflictDoNothing();
}

seed()
  .then(() => {
    sqlite.close();
    console.log("Seeded AssessmentOS SQLite demo data.");
  })
  .catch((error: unknown) => {
    sqlite.close();
    console.error(error);
    process.exit(1);
  });
