"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  KeyRound,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  addQuestionToSection,
  calculatePaperTotalMarks,
  calculateSectionMarks,
  moveQuestionInSection,
  removeQuestionFromSection,
  validatePaper,
} from "@/lib/papers/helpers";
import type {
  PaperBuilderItem,
  PaperQuestionItem,
  PaperSectionItem,
} from "@/lib/papers/types";
import type { QuestionRepositoryItem } from "@/lib/questions/types";

export function PaperEditorClient({
  initialPaper,
  repositoryQuestions,
}: {
  initialPaper: PaperBuilderItem;
  repositoryQuestions: QuestionRepositoryItem[];
}) {
  const [paper, setPaper] = useState(initialPaper);
  const [selectedSectionId, setSelectedSectionId] = useState(
    initialPaper.sections[0]?.id ?? "",
  );
  const [showAnswerKeys, setShowAnswerKeys] = useState(true);
  const validation = useMemo(() => validatePaper(paper), [paper]);
  const selectedSection =
    paper.sections.find((section) => section.id === selectedSectionId) ??
    paper.sections[0];

  function updateSection(sectionId: string, nextSection: PaperSectionItem) {
    setPaper((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? nextSection : section,
      ),
      updatedAt: new Date().toISOString(),
    }));
  }

  function addQuestion(question: QuestionRepositoryItem) {
    if (!selectedSection) {
      return;
    }

    updateSection(
      selectedSection.id,
      addQuestionToSection({ section: selectedSection, question }),
    );
  }

  function removeQuestion(sectionId: string, paperQuestionId: string) {
    const section = paper.sections.find((item) => item.id === sectionId);
    if (!section) {
      return;
    }

    updateSection(
      sectionId,
      removeQuestionFromSection({ section, paperQuestionId }),
    );
  }

  function moveQuestion(
    sectionId: string,
    paperQuestionId: string,
    direction: "up" | "down",
  ) {
    const section = paper.sections.find((item) => item.id === sectionId);
    if (!section) {
      return;
    }

    updateSection(
      sectionId,
      moveQuestionInSection({ section, paperQuestionId, direction }),
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <Link
            href="/dashboard/papers"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Papers
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            {paper.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {paper.gradeName} · {paper.subjectName} · {paper.durationMinutes}{" "}
            minutes · {validation.totalMarks} marks
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={formatStatus(paper.status)} tone="neutral" />
          <StatusBadge
            label={
              validation.issues.length
                ? `${validation.issues.length} validation issues`
                : "No validation issues"
            }
            tone={validation.issues.length ? "warning" : "success"}
          />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_360px]">
        <SectionOutline
          sections={paper.sections}
          selectedSectionId={selectedSection?.id}
          onSelect={setSelectedSectionId}
        />

        <main className="space-y-5">
          <PaperMetadata paper={paper} totalMarks={validation.totalMarks} />
          <TemplateApplicationNotice />
          <DocumentPreview
            paper={paper}
            showAnswerKeys={showAnswerKeys}
            onRemoveQuestion={removeQuestion}
            onMoveQuestion={moveQuestion}
          />
        </main>

        <aside className="space-y-5">
          <QuestionPicker
            questions={repositoryQuestions}
            onAddQuestion={addQuestion}
          />
          <ValidationPanel validation={validation} />
          <AnswerKeyPanel
            paper={paper}
            showAnswerKeys={showAnswerKeys}
            onToggle={() => setShowAnswerKeys((current) => !current)}
          />
        </aside>
      </div>
    </div>
  );
}

function SectionOutline({
  sections,
  selectedSectionId,
  onSelect,
}: {
  sections: PaperSectionItem[];
  selectedSectionId?: string;
  onSelect: (sectionId: string) => void;
}) {
  return (
    <aside className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <p className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Outline
      </p>
      <div className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm ${
              selectedSectionId === section.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span className="block font-medium">{section.title}</span>
            <span className="mt-1 block text-xs">
              {section.questions.length} questions ·{" "}
              {calculateSectionMarks(section)} marks
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function PaperMetadata({
  paper,
  totalMarks,
}: {
  paper: PaperBuilderItem;
  totalMarks: number;
}) {
  return (
    <section className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm md:grid-cols-4">
      <MetadataBadge label="Grade" value={paper.gradeName} />
      <MetadataBadge label="Subject" value={paper.subjectName} />
      <MetadataBadge label="Total marks" value={String(totalMarks)} />
      <MetadataBadge label="Duration" value={`${paper.durationMinutes} min`} />
    </section>
  );
}

function TemplateApplicationNotice() {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-sm font-semibold">Template application</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Template selection and paper rendering are represented in the
            template engine. Full template application to papers is planned for
            the next persistence-backed workflow.
          </p>
        </div>
        <Link
          href="/dashboard/templates"
          className="text-sm font-medium text-foreground hover:underline"
        >
          View templates
        </Link>
      </div>
    </section>
  );
}

function DocumentPreview({
  paper,
  showAnswerKeys,
  onRemoveQuestion,
  onMoveQuestion,
}: {
  paper: PaperBuilderItem;
  showAnswerKeys: boolean;
  onRemoveQuestion: (sectionId: string, paperQuestionId: string) => void;
  onMoveQuestion: (
    sectionId: string,
    paperQuestionId: string,
    direction: "up" | "down",
  ) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mx-auto max-w-3xl border border-border bg-background px-8 py-7 shadow-sm">
        <div className="border-b border-border pb-5 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Riverside International School
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal">
            {paper.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {paper.gradeName} · {paper.subjectName} · {paper.durationMinutes}{" "}
            minutes · {calculatePaperTotalMarks(paper.sections)} marks
          </p>
        </div>

        <div className="space-y-8 pt-6">
          {paper.sections.map((section) => (
            <section key={section.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">{section.title}</h3>
                  {section.instructions ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {section.instructions}
                    </p>
                  ) : null}
                </div>
                <span className="text-sm font-medium">
                  {calculateSectionMarks(section)}
                  {section.expectedMarks !== undefined
                    ? ` / ${section.expectedMarks}`
                    : ""}{" "}
                  marks
                </span>
              </div>

              {section.questions.length === 0 ? (
                <div className="mt-4 rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                  No questions in this section yet.
                </div>
              ) : (
                <ol className="mt-4 space-y-4">
                  {section.questions
                    .slice()
                    .sort((left, right) => left.order - right.order)
                    .map((paperQuestion) => (
                      <PaperQuestionPreview
                        key={paperQuestion.id}
                        sectionId={section.id}
                        paperQuestion={paperQuestion}
                        showAnswerKey={showAnswerKeys}
                        onRemoveQuestion={onRemoveQuestion}
                        onMoveQuestion={onMoveQuestion}
                      />
                    ))}
                </ol>
              )}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function PaperQuestionPreview({
  sectionId,
  paperQuestion,
  showAnswerKey,
  onRemoveQuestion,
  onMoveQuestion,
}: {
  sectionId: string;
  paperQuestion: PaperQuestionItem;
  showAnswerKey: boolean;
  onRemoveQuestion: (sectionId: string, paperQuestionId: string) => void;
  onMoveQuestion: (
    sectionId: string,
    paperQuestionId: string,
    direction: "up" | "down",
  ) => void;
}) {
  const question = paperQuestion.question;

  return (
    <li className="rounded-md border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {paperQuestion.order}. {question.prompt}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge
              label={`${paperQuestion.marks} marks`}
              tone="neutral"
            />
            <StatusBadge
              label={question.difficulty ?? "Difficulty not set"}
              tone="neutral"
            />
            <StatusBadge
              label={formatStatus(question.source.sourceType)}
              tone="neutral"
            />
            <StatusBadge
              label={formatStatus(question.source.rightsStatus)}
              tone={
                question.source.rightsStatus === "VERIFIED"
                  ? "success"
                  : "warning"
              }
            />
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveQuestion(sectionId, paperQuestion.id, "up")}
            aria-label="Move question up"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveQuestion(sectionId, paperQuestion.id, "down")}
            aria-label="Move question down"
          >
            <ArrowDown className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveQuestion(sectionId, paperQuestion.id)}
            aria-label="Remove question"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {showAnswerKey ? (
        <div className="mt-4 rounded-md bg-secondary p-3 text-sm">
          <p className="font-medium">Answer key</p>
          <p className="mt-1 text-muted-foreground">
            {question.answerKey.isComplete
              ? question.answerKey.answer
              : "No answer key supplied."}
          </p>
        </div>
      ) : null}
    </li>
  );
}

function QuestionPicker({
  questions,
  onAddQuestion,
}: {
  questions: QuestionRepositoryItem[];
  onAddQuestion: (question: QuestionRepositoryItem) => void;
}) {
  const availableQuestions = questions.filter(
    (question) => question.status !== "ARCHIVED",
  );

  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Question picker</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add repository questions to the selected section.
        </p>
      </div>
      <div className="max-h-[420px] divide-y divide-border overflow-y-auto">
        {availableQuestions.map((question) => (
          <div key={question.id} className="p-4">
            <p className="line-clamp-2 text-sm font-medium">
              {question.prompt}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge label={question.gradeName} tone="neutral" />
              <StatusBadge label={`${question.marks} marks`} tone="neutral" />
              <StatusBadge
                label={formatStatus(question.source.rightsStatus)}
                tone={
                  question.source.rightsStatus === "VERIFIED"
                    ? "success"
                    : "warning"
                }
              />
            </div>
            <Button
              className="mt-3 w-full"
              variant="outline"
              onClick={() => onAddQuestion(question)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add to section
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ValidationPanel({
  validation,
}: {
  validation: ReturnType<typeof validatePaper>;
}) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Validation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {validation.totalMarks} marks across {validation.sectionMarks.length}{" "}
          sections
        </p>
      </div>
      <div className="space-y-3 p-4">
        {validation.sectionMarks.map((section) => (
          <div key={section.sectionId} className="flex justify-between text-sm">
            <span>{section.title}</span>
            <span className="font-medium">
              {section.marks}
              {section.expectedMarks !== undefined
                ? ` / ${section.expectedMarks}`
                : ""}
            </span>
          </div>
        ))}
        <div className="border-t border-border pt-3">
          {validation.issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No obvious issues found.
            </p>
          ) : (
            <div className="space-y-2">
              {validation.issues.map((issue) => (
                <div
                  key={`${issue.code}-${issue.message}`}
                  className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                >
                  <p className="font-medium">{formatStatus(issue.code)}</p>
                  <p className="mt-1">{issue.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AnswerKeyPanel({
  paper,
  showAnswerKeys,
  onToggle,
}: {
  paper: PaperBuilderItem;
  showAnswerKeys: boolean;
  onToggle: () => void;
}) {
  const questionCount = paper.sections.reduce(
    (total, section) => total + section.questions.length,
    0,
  );
  const completeCount = paper.sections.reduce(
    (total, section) =>
      total +
      section.questions.filter(
        (paperQuestion) => paperQuestion.question.answerKey.isComplete,
      ).length,
    0,
  );

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="size-4" aria-hidden="true" />
            Teacher answer key
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {completeCount} of {questionCount} questions have answer keys.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onToggle}>
          <Eye className="size-4" aria-hidden="true" />
          {showAnswerKeys ? "Hide" : "Show"}
        </Button>
      </div>
    </section>
  );
}

function MetadataBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "success" | "warning";
}) {
  const className = {
    neutral: "border-border bg-secondary text-muted-foreground",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  }[tone];

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
