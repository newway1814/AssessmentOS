export type ValidationIssue = {
  code: string;
  message: string;
  severity: "INFO" | "WARNING" | "ERROR";
};

export type PaperQuestionForValidation = {
  questionId: string;
  marks: number;
  hasAnswerKey: boolean;
};

export type PaperSectionForValidation = {
  id: string;
  title: string;
  expectedMarks?: number;
  questions: PaperQuestionForValidation[];
};

export function validateTotalMarks({
  expectedTotal,
  sections,
}: {
  expectedTotal: number;
  sections: PaperSectionForValidation[];
}): ValidationIssue[] {
  const actualTotal = sections.reduce(
    (total, section) => total + sectionMarks(section),
    0,
  );

  if (actualTotal === expectedTotal) {
    return [];
  }

  return [
    {
      code: "TOTAL_MARKS_MISMATCH",
      severity: "ERROR",
      message: `Expected ${expectedTotal} marks, but paper contains ${actualTotal} marks.`,
    },
  ];
}

export function detectDuplicateQuestions(
  sections: PaperSectionForValidation[],
): ValidationIssue[] {
  const seenQuestionIds = new Set<string>();
  const duplicateQuestionIds = new Set<string>();

  for (const section of sections) {
    for (const question of section.questions) {
      if (seenQuestionIds.has(question.questionId)) {
        duplicateQuestionIds.add(question.questionId);
      }

      seenQuestionIds.add(question.questionId);
    }
  }

  return Array.from(duplicateQuestionIds).map((questionId) => ({
    code: "DUPLICATE_QUESTION",
    severity: "WARNING",
    message: `Question ${questionId} appears more than once in this paper.`,
  }));
}

export function detectMissingAnswerKeys(
  sections: PaperSectionForValidation[],
): ValidationIssue[] {
  return sections.flatMap((section) =>
    section.questions
      .filter((question) => !question.hasAnswerKey)
      .map((question) => ({
        code: "MISSING_ANSWER_KEY",
        severity: "WARNING" as const,
        message: `Question ${question.questionId} in ${section.title} is missing an answer key.`,
      })),
  );
}

export function validateSectionMarks(
  sections: PaperSectionForValidation[],
): ValidationIssue[] {
  return sections.flatMap((section) => {
    if (section.expectedMarks === undefined) {
      return [];
    }

    const actualMarks = sectionMarks(section);

    if (actualMarks === section.expectedMarks) {
      return [];
    }

    return [
      {
        code: "SECTION_MARKS_MISMATCH",
        severity: "ERROR" as const,
        message: `${section.title} expects ${section.expectedMarks} marks, but contains ${actualMarks} marks.`,
      },
    ];
  });
}

function sectionMarks(section: PaperSectionForValidation) {
  return section.questions.reduce(
    (total, question) => total + question.marks,
    0,
  );
}
