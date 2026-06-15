import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.validationResult.deleteMany();
  await prisma.answerKey.deleteMany();
  await prisma.rubric.deleteMany();
  await prisma.paperQuestion.deleteMany();
  await prisma.paperSection.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.templateVersion.deleteMany();
  await prisma.template.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.questionVersion.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionSource.deleteMany();
  await prisma.upload.deleteMany();
  await prisma.subtopic.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.role.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.campus.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();

  const school = await prisma.school.create({
    data: {
      name: "Riverside International School",
      slug: "riverside-international",
    },
  });

  const campus = await prisma.campus.create({
    data: {
      schoolId: school.id,
      name: "Main Campus",
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      schoolId: school.id,
      campusId: campus.id,
      name: "Academic Coordination",
    },
  });

  const [teacher, coordinator] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Maya Tan",
        email: "maya.tan@example.edu",
      },
    }),
    prisma.user.create({
      data: {
        name: "Daniel Rao",
        email: "daniel.rao@example.edu",
      },
    }),
  ]);

  await prisma.role.createMany({
    data: [
      {
        schoolId: school.id,
        workspaceId: workspace.id,
        userId: teacher.id,
        name: "TEACHER",
      },
      {
        schoolId: school.id,
        workspaceId: workspace.id,
        userId: coordinator.id,
        name: "ACADEMIC_COORDINATOR",
      },
    ],
  });

  const subject = await prisma.subject.create({
    data: {
      schoolId: school.id,
      workspaceId: workspace.id,
      name: "Mathematics",
      code: "MATH",
    },
  });

  const grade = await prisma.grade.create({
    data: {
      schoolId: school.id,
      workspaceId: workspace.id,
      name: "Grade 8",
      order: 8,
    },
  });

  const chapter = await prisma.chapter.create({
    data: {
      schoolId: school.id,
      workspaceId: workspace.id,
      subjectId: subject.id,
      name: "Linear Equations",
      order: 1,
    },
  });

  const subtopic = await prisma.subtopic.create({
    data: {
      schoolId: school.id,
      workspaceId: workspace.id,
      chapterId: chapter.id,
      name: "Solving one-variable equations",
      order: 1,
    },
  });

  const source = await prisma.questionSource.create({
    data: {
      schoolId: school.id,
      workspaceId: workspace.id,
      createdById: teacher.id,
      sourceType: "TEACHER_CREATED",
      title: "Teacher-authored Grade 8 algebra set",
      author: teacher.name,
      owner: school.name,
      rightsStatus: "VERIFIED",
      usageRights:
        "Teacher-created content for Riverside International School internal use.",
      verifiedAt: new Date(),
    },
  });

  const question = await prisma.question.create({
    data: {
      schoolId: school.id,
      workspaceId: workspace.id,
      sourceId: source.id,
      subjectId: subject.id,
      gradeId: grade.id,
      chapterId: chapter.id,
      subtopicId: subtopic.id,
      createdById: teacher.id,
      type: "SHORT_ANSWER",
      prompt: "Solve for x: 3x + 5 = 20.",
      marks: 2,
      difficulty: "Foundational",
      status: "READY",
    },
  });

  const version = await prisma.questionVersion.create({
    data: {
      questionId: question.id,
      editedById: teacher.id,
      versionNumber: 1,
      promptSnapshot: question.prompt,
      metadataSnapshot: {
        type: question.type,
        marks: question.marks,
        difficulty: question.difficulty,
      },
      changeReason: "Initial teacher-authored version.",
    },
  });

  await prisma.answerKey.create({
    data: {
      questionId: question.id,
      questionVersionId: version.id,
      isComplete: true,
      content: {
        answer: "x = 5",
        working: "3x = 15, therefore x = 5.",
      },
    },
  });

  const template = await prisma.template.create({
    data: {
      schoolId: school.id,
      workspaceId: workspace.id,
      createdById: coordinator.id,
      name: "Riverside Standard Exam Paper",
      type: "EXAM",
      status: "ACTIVE",
    },
  });

  const templateVersion = await prisma.templateVersion.create({
    data: {
      templateId: template.id,
      versionNumber: 1,
      structure: {
        pageSize: "A4",
        header: "Riverside International School",
        sections: ["Section A"],
      },
      changeReason: "Initial MVP template version.",
    },
  });

  const paper = await prisma.paper.create({
    data: {
      schoolId: school.id,
      workspaceId: workspace.id,
      subjectId: subject.id,
      gradeId: grade.id,
      templateVersionId: templateVersion.id,
      createdById: teacher.id,
      title: "Grade 8 Algebra Checkpoint",
    },
  });

  const section = await prisma.paperSection.create({
    data: {
      paperId: paper.id,
      title: "Section A",
      instructions: "Answer all questions.",
      order: 1,
      marks: 2,
    },
  });

  await prisma.paperQuestion.create({
    data: {
      paperSectionId: section.id,
      questionId: question.id,
      questionVersionId: version.id,
      order: 1,
    },
  });

  await prisma.validationResult.create({
    data: {
      schoolId: school.id,
      workspaceId: workspace.id,
      targetType: "PAPER",
      targetId: paper.id,
      severity: "INFO",
      code: "PAPER_READY_PLACEHOLDER",
      message: "Demo paper has the minimum metadata and one complete question.",
    },
  });

  await prisma.auditLog.create({
    data: {
      schoolId: school.id,
      workspaceId: workspace.id,
      actorId: coordinator.id,
      action: "seed.demo_workspace_created",
      targetType: "Workspace",
      targetId: workspace.id,
      metadata: {
        source: "prisma/seed.ts",
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
