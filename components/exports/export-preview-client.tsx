"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  KeyRound,
  Printer,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  ExportCopyMode,
  ExportPreviewMode,
  PaperExportPreview,
} from "@/lib/exports/types";

export function ExportPreviewClient({
  preview,
}: {
  preview: PaperExportPreview;
}) {
  const [copyMode, setCopyMode] = useState<ExportCopyMode>("STUDENT");
  const [previewMode, setPreviewMode] =
    useState<ExportPreviewMode>("ASSESSMENT");
  const showAnswerKey = copyMode === "TEACHER";

  function printPage() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <Link
            href="/dashboard/exports"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Exports
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            {preview.paper.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Print-ready preview with mocked export readiness. PDF and DOCX
            generation are not connected yet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SegmentedButton
            active={copyMode === "STUDENT"}
            onClick={() => setCopyMode("STUDENT")}
          >
            Student copy
          </SegmentedButton>
          <SegmentedButton
            active={copyMode === "TEACHER"}
            onClick={() => setCopyMode("TEACHER")}
          >
            Teacher copy
          </SegmentedButton>
          <SegmentedButton
            active={previewMode === "ASSIGNMENT"}
            onClick={() =>
              setPreviewMode((current) =>
                current === "ASSIGNMENT" ? "ASSESSMENT" : "ASSIGNMENT",
              )
            }
          >
            Assignment mode
          </SegmentedButton>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <PrintPreview
            preview={preview}
            copyMode={copyMode}
            previewMode={previewMode}
            showAnswerKey={showAnswerKey}
          />
        </main>
        <aside className="space-y-5">
          <ExportActions onPrint={printPage} />
          <ReadinessPanel preview={preview} />
          <TemplatePanel preview={preview} />
        </aside>
      </div>
    </div>
  );
}

function PrintPreview({
  preview,
  copyMode,
  previewMode,
  showAnswerKey,
}: {
  preview: PaperExportPreview;
  copyMode: ExportCopyMode;
  previewMode: ExportPreviewMode;
  showAnswerKey: boolean;
}) {
  const { paper, template } = preview;

  return (
    <article className="mx-auto max-w-4xl border border-border bg-background px-10 py-8 shadow-sm print:border-0 print:shadow-none">
      <header className="border-b border-border pb-5">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-sm font-semibold">
            {template.logoUrl ? "Logo" : "AO"}
          </div>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide">
              {template.schoolName}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">
              {template.headerText}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {paper.gradeName} | {paper.subjectName} | {paper.durationMinutes}{" "}
              minutes | {preview.totalMarks} marks
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {copyMode === "TEACHER" ? "Teacher copy" : "Student copy"} |{" "}
              {previewMode === "ASSIGNMENT"
                ? "Assignment mode"
                : "Assessment mode"}
            </p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-x-8 gap-y-3 border-b border-border py-5 text-sm">
        {template.studentMetadataFields.map((field) => (
          <div key={field} className="flex items-center gap-3">
            <span className="w-24 text-muted-foreground">{field}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        ))}
      </section>

      <section className="border-b border-border py-5">
        <h3 className="text-sm font-semibold">Instructions</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {template.examInstructions}
        </p>
      </section>

      <section className="space-y-8 py-6">
        {paper.sections.map((section) => (
          <div key={section.id}>
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
                {section.questions.reduce(
                  (total, question) => total + question.marks,
                  0,
                )}{" "}
                marks
              </span>
            </div>
            <ol className="mt-4 space-y-5">
              {section.questions.map((paperQuestion) => (
                <li key={paperQuestion.id} className="text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium">
                      {paperQuestion.order}. {paperQuestion.question.prompt}
                    </p>
                    <span className="shrink-0 text-muted-foreground">
                      [{paperQuestion.marks}]
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{paperQuestion.question.difficulty}</span>
                    <span>{paperQuestion.question.source.sourceType}</span>
                    <span>{paperQuestion.question.source.rightsStatus}</span>
                  </div>
                  {previewMode === "ASSIGNMENT" ? (
                    <AssignmentModeBlocks />
                  ) : (
                    <AnswerSpace />
                  )}
                  {showAnswerKey ? (
                    <div className="mt-3 rounded-md bg-secondary p-3">
                      <p className="flex items-center gap-2 font-medium">
                        <KeyRound className="size-4" aria-hidden="true" />
                        Answer key
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {paperQuestion.question.answerKey.isComplete
                          ? paperQuestion.question.answerKey.answer
                          : "No answer key supplied."}
                      </p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <footer className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
        {template.footerText}
      </footer>
    </article>
  );
}

function AssignmentModeBlocks() {
  return (
    <div className="mt-3 grid gap-3">
      <div className="rounded-md border border-dashed border-border p-3 text-muted-foreground">
        Answer space
      </div>
      <div className="rounded-md border border-dashed border-border p-3 text-muted-foreground">
        Hint box placeholder
      </div>
      <div className="rounded-md border border-dashed border-border p-3 text-muted-foreground">
        Scaffolded steps placeholder
      </div>
      <div className="rounded-md border border-dashed border-border p-3 text-muted-foreground">
        Practice variation placeholder. AI generation is not connected.
      </div>
    </div>
  );
}

function AnswerSpace() {
  return (
    <div className="mt-3 space-y-3">
      <div className="h-px bg-border" />
      <div className="h-px bg-border" />
      <div className="h-px bg-border" />
    </div>
  );
}

function ExportActions({ onPrint }: { onPrint: () => void }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Export controls</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        PDF and DOCX rendering are placeholders. Print uses browser print.
      </p>
      <div className="mt-4 grid gap-2">
        <Button variant="outline" disabled>
          <FileText className="size-4" aria-hidden="true" />
          Export PDF placeholder
        </Button>
        <Button variant="outline" disabled>
          <FileText className="size-4" aria-hidden="true" />
          Export DOCX placeholder
        </Button>
        <Button onClick={onPrint}>
          <Printer className="size-4" aria-hidden="true" />
          Print preview
        </Button>
      </div>
    </section>
  );
}

function ReadinessPanel({ preview }: { preview: PaperExportPreview }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Readiness checklist</h2>
      <div className="mt-4 space-y-3">
        {preview.checklist.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 rounded-md border border-border p-3"
          >
            {item.isReady ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            ) : (
              <Wrench className="mt-0.5 size-4 shrink-0 text-amber-600" />
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
  );
}

function TemplatePanel({ preview }: { preview: PaperExportPreview }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Template metadata</h2>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <MetadataItem label="Template" value={preview.template.name} />
        <MetadataItem label="School" value={preview.template.schoolName} />
        <MetadataItem
          label="Duration"
          value={`${preview.template.defaultDurationMinutes} min`}
        />
        <MetadataItem
          label="Marks"
          value={`${preview.template.defaultTotalMarks}`}
        />
      </dl>
    </section>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function SegmentedButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-sm font-medium ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
