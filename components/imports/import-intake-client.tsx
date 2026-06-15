"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileArchive,
  FileImage,
  FileText,
  LibraryBig,
  PencilLine,
  Plus,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  questionTypes,
  rightsStatuses,
  sourceTypes,
} from "@/lib/domain/constants";
import {
  buildImportReadiness,
  countQuestionsByReviewStatus,
  createMockNormalizedQuestions,
} from "@/lib/imports/helpers";
import type {
  ImportSourceOption,
  ImportStatus,
  NewImportDraft,
  NormalizedQuestionCard,
  QuestionImportBatch,
} from "@/lib/imports/types";
import { importSourceOptions } from "@/lib/imports/types";

type IntakeMode = "history" | "new" | "review";

const sourceOptionMeta: Record<
  ImportSourceOption,
  { label: string; description: string; icon: typeof FileText }
> = {
  PDF: {
    label: "PDF",
    description: "Upload placeholder for exam PDFs and worksheets.",
    icon: FileText,
  },
  IMAGE_SCAN: {
    label: "Image / scan",
    description: "Placeholder for scanned pages and photos.",
    icon: FileImage,
  },
  DOCX: {
    label: "DOCX",
    description: "Upload placeholder for Word assessment files.",
    icon: FileArchive,
  },
  PASTED_TEXT: {
    label: "Pasted text",
    description: "Paste teacher-authored questions for mock normalization.",
    icon: PencilLine,
  },
  SCHOOL_REPOSITORY_BATCH: {
    label: "School repository batch",
    description: "Placeholder for internal repository migration batches.",
    icon: LibraryBig,
  },
  VERIFIED_EXTERNAL_SOURCE: {
    label: "Verified external source",
    description: "Placeholder only. No scraping or live partner import.",
    icon: ShieldCheck,
  },
};

const initialDraft: NewImportDraft = {
  sourceOption: "PASTED_TEXT",
  pastedText:
    "Solve 3x + 7 = 28 and show each step.\nWrite one real-world situation represented by 4x + 10 = 38.",
  fileName: "",
  sourceTitle: "Grade 8 teacher worksheet",
  sourceReference: "Teacher-created worksheet, June 2026",
  sourceType: "TEACHER_CREATED",
  rightsStatus: "VERIFIED",
};

export function ImportIntakeClient({
  initialImports,
}: {
  initialImports: QuestionImportBatch[];
}) {
  const [imports, setImports] = useState(initialImports);
  const [mode, setMode] = useState<IntakeMode>("history");
  const [draft, setDraft] = useState<NewImportDraft>(initialDraft);
  const [activeImport, setActiveImport] = useState<QuestionImportBatch | null>(
    initialImports[0] ?? null,
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    initialImports[0]?.normalizedQuestions[0]?.id ?? "",
  );
  const [questions, setQuestions] = useState<NormalizedQuestionCard[]>(
    initialImports[0]?.normalizedQuestions ?? [],
  );

  const selectedQuestion =
    questions.find((question) => question.id === selectedQuestionId) ??
    questions[0];
  const reviewCounts = useMemo(
    () => countQuestionsByReviewStatus(questions),
    [questions],
  );
  const previewBatch = useMemo(
    () =>
      activeImport
        ? {
            ...activeImport,
            normalizedQuestions: questions,
            questionCount: questions.length,
          }
        : undefined,
    [activeImport, questions],
  );

  function startNewImport() {
    setMode("new");
    setActiveImport(null);
    setQuestions([]);
    setSelectedQuestionId("");
  }

  function startReview(batch: QuestionImportBatch) {
    setActiveImport(batch);
    setQuestions(batch.normalizedQuestions);
    setSelectedQuestionId(batch.normalizedQuestions[0]?.id ?? "");
    setMode("review");
  }

  function createMockImport() {
    const normalizedQuestions = createMockNormalizedQuestions(draft);
    const nextImport: QuestionImportBatch = {
      id: `import-${Date.now()}`,
      title: draft.sourceTitle || draft.fileName || "New import draft",
      sourceOption: draft.sourceOption,
      status: "NEEDS_REVIEW",
      submittedBy: "Current teacher",
      createdAt: new Date().toISOString(),
      questionCount: normalizedQuestions.length,
      rightsSummary:
        "Mock AI normalization only. Review source and rights metadata before repository approval.",
      pastedText: draft.pastedText,
      fileName: draft.fileName || undefined,
      normalizedQuestions,
    };

    setImports((current) => [nextImport, ...current]);
    setActiveImport(nextImport);
    setQuestions(normalizedQuestions);
    setSelectedQuestionId(normalizedQuestions[0]?.id ?? "");
    setMode("review");
  }

  function updateQuestion<Key extends keyof NormalizedQuestionCard>(
    questionId: string,
    key: Key,
    value: NormalizedQuestionCard[Key],
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId ? { ...question, [key]: value } : question,
      ),
    );
  }

  function setQuestionStatus(
    questionId: string,
    status: NormalizedQuestionCard["status"],
  ) {
    updateQuestion(questionId, "status", status);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Question intake
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Import and review normalized question cards
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Bring in school-owned or licensed assessment material, preview mock
            normalization, and review metadata before adding anything to the
            repository.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMode("history")}>
            History
          </Button>
          <Button onClick={startNewImport}>
            <Plus className="size-4" aria-hidden="true" />
            New import
          </Button>
        </div>
      </section>

      <RightsCallout />

      {mode === "history" ? (
        <ImportHistory imports={imports} onReview={startReview} />
      ) : null}

      {mode === "new" ? (
        <NewImportFlow
          draft={draft}
          onDraftChange={setDraft}
          onCreateMockImport={createMockImport}
        />
      ) : null}

      {mode === "review" && previewBatch ? (
        <ReviewWorkspace
          batch={previewBatch}
          questions={questions}
          selectedQuestion={selectedQuestion}
          reviewCounts={reviewCounts}
          onSelectQuestion={setSelectedQuestionId}
          onUpdateQuestion={updateQuestion}
          onSetQuestionStatus={setQuestionStatus}
        />
      ) : null}
    </div>
  );
}

function RightsCallout() {
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">Content rights rule</h2>
          <p className="mt-1 leading-6">
            Do not import random copyrighted web content or scrape external
            sources. Imported questions must be school-owned, teacher-created,
            licensed, open, public-domain, or verified partner content, and each
            question must preserve source and usage-rights metadata.
          </p>
        </div>
      </div>
    </section>
  );
}

function ImportHistory({
  imports,
  onReview,
}: {
  imports: QuestionImportBatch[];
  onReview: (batch: QuestionImportBatch) => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Import history</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {imports.length} mocked import batches in this workspace
        </p>
      </div>
      {imports.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <UploadCloud className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-4 text-sm font-semibold">No imports yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a new import to review normalized question cards.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Batch</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Questions</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Rights</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {imports.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/70">
                  <td className="px-5 py-4">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.submittedBy} · {formatDate(item.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {sourceOptionMeta[item.sourceOption].label}
                  </td>
                  <td className="px-4 py-4">{item.questionCount}</td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      label={formatLabel(item.status)}
                      tone={importStatusTone(item.status)}
                    />
                  </td>
                  <td className="max-w-[260px] px-4 py-4 text-muted-foreground">
                    {item.rightsSummary}
                  </td>
                  <td className="px-4 py-4">
                    <Button variant="outline" onClick={() => onReview(item)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function NewImportFlow({
  draft,
  onDraftChange,
  onCreateMockImport,
}: {
  draft: NewImportDraft;
  onDraftChange: (draft: NewImportDraft) => void;
  onCreateMockImport: () => void;
}) {
  function update<Key extends keyof NewImportDraft>(
    key: Key,
    value: NewImportDraft[Key],
  ) {
    onDraftChange({ ...draft, [key]: value });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-5">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Choose import source</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {importSourceOptions.map((option) => {
              const meta = sourceOptionMeta[option];
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => update("sourceOption", option)}
                  className={`rounded-lg border p-4 text-left transition hover:bg-secondary ${
                    draft.sourceOption === option
                      ? "border-primary bg-secondary"
                      : "border-border bg-background"
                  }`}
                >
                  <meta.icon className="size-5 text-muted-foreground" />
                  <p className="mt-3 text-sm font-semibold">{meta.label}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {meta.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Source content</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-dashed border-border bg-secondary p-6 text-center">
              <UploadCloud className="mx-auto size-10 text-muted-foreground" />
              <h3 className="mt-4 text-sm font-semibold">Upload placeholder</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                PDF, image, DOCX, and batch upload storage are not connected
                yet. Enter a representative filename for this mock intake.
              </p>
              <input
                value={draft.fileName}
                onChange={(event) => update("fileName", event.target.value)}
                placeholder="grade-8-algebra-paper.pdf"
                className={`${fieldClassName} mt-4 w-full`}
              />
            </div>
            <Field label="Pasted text">
              <textarea
                value={draft.pastedText}
                onChange={(event) => update("pastedText", event.target.value)}
                className="min-h-56 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Paste teacher-created or licensed questions..."
              />
            </Field>
          </div>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Source metadata</h2>
          <div className="mt-4 space-y-4">
            <Field label="Source title">
              <input
                value={draft.sourceTitle}
                onChange={(event) => update("sourceTitle", event.target.value)}
                className={fieldClassName}
              />
            </Field>
            <Field label="Source/reference">
              <input
                value={draft.sourceReference}
                onChange={(event) =>
                  update("sourceReference", event.target.value)
                }
                className={fieldClassName}
              />
            </Field>
            <Field label="Source type">
              <select
                value={draft.sourceType}
                onChange={(event) =>
                  update(
                    "sourceType",
                    event.target.value as NewImportDraft["sourceType"],
                  )
                }
                className={fieldClassName}
              >
                {sourceTypes.map((sourceType) => (
                  <option key={sourceType} value={sourceType}>
                    {formatLabel(sourceType)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rights status">
              <select
                value={draft.rightsStatus}
                onChange={(event) =>
                  update(
                    "rightsStatus",
                    event.target.value as NewImportDraft["rightsStatus"],
                  )
                }
                className={fieldClassName}
              >
                {rightsStatuses.map((rightsStatus) => (
                  <option key={rightsStatus} value={rightsStatus}>
                    {formatLabel(rightsStatus)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Button className="mt-5 w-full" onClick={onCreateMockImport}>
            Mock normalize questions
          </Button>
        </section>
      </aside>
    </div>
  );
}

function ReviewWorkspace({
  batch,
  questions,
  selectedQuestion,
  reviewCounts,
  onSelectQuestion,
  onUpdateQuestion,
  onSetQuestionStatus,
}: {
  batch: QuestionImportBatch;
  questions: NormalizedQuestionCard[];
  selectedQuestion?: NormalizedQuestionCard;
  reviewCounts: ReturnType<typeof countQuestionsByReviewStatus>;
  onSelectQuestion: (questionId: string) => void;
  onUpdateQuestion: <Key extends keyof NormalizedQuestionCard>(
    questionId: string,
    key: Key,
    value: NormalizedQuestionCard[Key],
  ) => void;
  onSetQuestionStatus: (
    questionId: string,
    status: NormalizedQuestionCard["status"],
  ) => void;
}) {
  const readiness = buildImportReadiness(batch);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="space-y-5">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h2 className="text-sm font-semibold">{batch.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Mock AI normalization preview · no repository write occurs.
              </p>
            </div>
            <StatusBadge label={formatLabel(batch.status)} tone="warning" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Metric label="Needs review" value={reviewCounts.NEEDS_REVIEW} />
            <Metric label="Approved" value={reviewCounts.APPROVED} />
            <Metric label="Edit later" value={reviewCounts.EDIT_LATER} />
            <Metric label="Rejected" value={reviewCounts.REJECTED} />
          </div>
        </div>

        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-5 py-14 text-center shadow-sm">
              <FileText className="mx-auto size-10 text-muted-foreground" />
              <h3 className="mt-4 text-sm font-semibold">
                No normalized cards yet
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                OCR and AI normalization are placeholders for this source.
              </p>
            </div>
          ) : (
            questions.map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={() => onSelectQuestion(question.id)}
                className={`w-full rounded-lg border bg-card p-5 text-left shadow-sm hover:bg-secondary ${
                  selectedQuestion?.id === question.id
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <StatusBadge
                      label={formatLabel(question.status)}
                      tone={reviewStatusTone(question.status)}
                    />
                    <p className="mt-3 text-sm font-medium leading-6">
                      {question.prompt}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {question.marks} marks
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{question.gradeName}</span>
                  <span>{question.subjectName}</span>
                  <span>{question.chapterName}</span>
                  <span>{formatLabel(question.sourceType)}</span>
                  <span>{formatLabel(question.rightsStatus)}</span>
                  <span>
                    {Math.round(question.confidence * 100)}% confidence
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Import readiness</h2>
          <div className="mt-4 space-y-3">
            {readiness.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-md border border-border p-3"
              >
                {item.isReady ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                )}
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedQuestion ? (
          <QuestionMetadataInspector
            question={selectedQuestion}
            onUpdateQuestion={onUpdateQuestion}
            onSetQuestionStatus={onSetQuestionStatus}
          />
        ) : null}
      </aside>
    </div>
  );
}

function QuestionMetadataInspector({
  question,
  onUpdateQuestion,
  onSetQuestionStatus,
}: {
  question: NormalizedQuestionCard;
  onUpdateQuestion: <Key extends keyof NormalizedQuestionCard>(
    questionId: string,
    key: Key,
    value: NormalizedQuestionCard[Key],
  ) => void;
  onSetQuestionStatus: (
    questionId: string,
    status: NormalizedQuestionCard["status"],
  ) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="text-sm font-semibold">Metadata inspector</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Edits stay in this mocked review session.
        </p>
      </div>
      <div className="space-y-4 p-5">
        <Field label="Prompt">
          <textarea
            value={question.prompt}
            onChange={(event) =>
              onUpdateQuestion(question.id, "prompt", event.target.value)
            }
            className="min-h-28 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Grade">
            <input
              value={question.gradeName}
              onChange={(event) =>
                onUpdateQuestion(question.id, "gradeName", event.target.value)
              }
              className={fieldClassName}
            />
          </Field>
          <Field label="Subject">
            <input
              value={question.subjectName}
              onChange={(event) =>
                onUpdateQuestion(question.id, "subjectName", event.target.value)
              }
              className={fieldClassName}
            />
          </Field>
        </div>
        <Field label="Chapter">
          <input
            value={question.chapterName}
            onChange={(event) =>
              onUpdateQuestion(question.id, "chapterName", event.target.value)
            }
            className={fieldClassName}
          />
        </Field>
        <Field label="Subtopic">
          <input
            value={question.subtopicName}
            onChange={(event) =>
              onUpdateQuestion(question.id, "subtopicName", event.target.value)
            }
            className={fieldClassName}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Marks">
            <input
              type="number"
              min="0"
              value={question.marks}
              onChange={(event) =>
                onUpdateQuestion(
                  question.id,
                  "marks",
                  Number(event.target.value),
                )
              }
              className={fieldClassName}
            />
          </Field>
          <Field label="Difficulty">
            <input
              value={question.difficulty}
              onChange={(event) =>
                onUpdateQuestion(question.id, "difficulty", event.target.value)
              }
              className={fieldClassName}
            />
          </Field>
        </div>
        <Field label="Question type">
          <select
            value={question.type}
            onChange={(event) =>
              onUpdateQuestion(
                question.id,
                "type",
                event.target.value as NormalizedQuestionCard["type"],
              )
            }
            className={fieldClassName}
          >
            {questionTypes.map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Answer key">
          <textarea
            value={question.answerKey}
            onChange={(event) =>
              onUpdateQuestion(question.id, "answerKey", event.target.value)
            }
            className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source type">
            <select
              value={question.sourceType}
              onChange={(event) =>
                onUpdateQuestion(
                  question.id,
                  "sourceType",
                  event.target.value as NormalizedQuestionCard["sourceType"],
                )
              }
              className={fieldClassName}
            >
              {sourceTypes.map((sourceType) => (
                <option key={sourceType} value={sourceType}>
                  {formatLabel(sourceType)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rights">
            <select
              value={question.rightsStatus}
              onChange={(event) =>
                onUpdateQuestion(
                  question.id,
                  "rightsStatus",
                  event.target.value as NormalizedQuestionCard["rightsStatus"],
                )
              }
              className={fieldClassName}
            >
              {rightsStatuses.map((rightsStatus) => (
                <option key={rightsStatus} value={rightsStatus}>
                  {formatLabel(rightsStatus)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Source title">
          <input
            value={question.sourceTitle}
            onChange={(event) =>
              onUpdateQuestion(question.id, "sourceTitle", event.target.value)
            }
            className={fieldClassName}
          />
        </Field>
        <Field label="Source/reference">
          <input
            value={question.sourceReference}
            onChange={(event) =>
              onUpdateQuestion(
                question.id,
                "sourceReference",
                event.target.value,
              )
            }
            className={fieldClassName}
          />
        </Field>
        <div className="grid gap-2">
          <Button
            onClick={() => onSetQuestionStatus(question.id, "APPROVED")}
            disabled={question.status === "APPROVED"}
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Approve to repository placeholder
          </Button>
          <Button
            variant="outline"
            onClick={() => onSetQuestionStatus(question.id, "EDIT_LATER")}
          >
            Edit later
          </Button>
          <Button
            variant="ghost"
            onClick={() => onSetQuestionStatus(question.id, "REJECTED")}
          >
            <XCircle className="size-4" aria-hidden="true" />
            Reject
          </Button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      {label}
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-secondary p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClassName = {
    neutral: "border-border bg-secondary text-muted-foreground",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${toneClassName}`}
    >
      {label}
    </span>
  );
}

const fieldClassName =
  "h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function importStatusTone(
  status: ImportStatus,
): "neutral" | "success" | "warning" | "danger" {
  if (status === "APPROVED") {
    return "success";
  }

  if (status === "REJECTED") {
    return "danger";
  }

  if (status === "NEEDS_REVIEW" || status === "NORMALIZING") {
    return "warning";
  }

  return "neutral";
}

function reviewStatusTone(
  status: NormalizedQuestionCard["status"],
): "neutral" | "success" | "warning" | "danger" {
  if (status === "APPROVED") {
    return "success";
  }

  if (status === "REJECTED") {
    return "danger";
  }

  if (status === "EDIT_LATER") {
    return "neutral";
  }

  return "warning";
}
