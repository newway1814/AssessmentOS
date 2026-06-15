"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, FileUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TemplatePreview } from "@/components/templates/template-preview";
import { templateStatuses, templateTypes } from "@/lib/domain/constants";
import {
  calculateTemplatePatternMarks,
  createMockImportPreview,
  summarizeTemplateReadiness,
} from "@/lib/templates/helpers";
import type {
  SchoolTemplateFormValues,
  SchoolTemplateItem,
  StudentMetadataField,
  TemplateImportPreview,
  TemplateSectionPattern,
} from "@/lib/templates/types";

const metadataFieldOptions: StudentMetadataField[] = [
  "Name",
  "Roll number",
  "Class",
  "Section",
  "Date",
];

export function TemplateEditorClient({
  initialTemplate,
}: {
  initialTemplate: SchoolTemplateItem;
}) {
  const [template, setTemplate] = useState(initialTemplate);
  const [draft, setDraft] = useState<SchoolTemplateFormValues>(
    toFormValues(initialTemplate),
  );
  const [importPreview, setImportPreview] =
    useState<TemplateImportPreview | null>(null);
  const readiness = summarizeTemplateReadiness(template);

  function saveTemplate() {
    setTemplate((current) => ({
      ...current,
      ...draft,
      versionNumber: current.versionNumber + 1,
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateSection(index: number, nextSection: TemplateSectionPattern) {
    setDraft((current) => ({
      ...current,
      sectionPattern: current.sectionPattern.map((section, sectionIndex) =>
        sectionIndex === index ? nextSection : section,
      ),
    }));
  }

  function addSection() {
    setDraft((current) => ({
      ...current,
      sectionPattern: [
        ...current.sectionPattern,
        {
          title: `Section ${String.fromCharCode(65 + current.sectionPattern.length)}`,
          instructions: "Add section instructions.",
          expectedMarks: 10,
        },
      ],
    }));
  }

  function removeSection(index: number) {
    setDraft((current) => ({
      ...current,
      sectionPattern: current.sectionPattern.filter(
        (_, sectionIndex) => sectionIndex !== index,
      ),
    }));
  }

  function toggleMetadataField(field: StudentMetadataField) {
    setDraft((current) => ({
      ...current,
      studentMetadataFields: current.studentMetadataFields.includes(field)
        ? current.studentMetadataFields.filter((item) => item !== field)
        : [...current.studentMetadataFields, field],
    }));
  }

  const previewTemplate: SchoolTemplateItem = {
    ...template,
    ...draft,
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Templates
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            {template.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            v{template.versionNumber} | {formatLabel(template.type)} |{" "}
            {template.defaultDurationMinutes} minutes |{" "}
            {template.defaultTotalMarks} marks
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            label={formatLabel(template.status)}
            tone={statusTone(template.status)}
          />
          <StatusBadge
            label={
              readiness.isReady ? "Ready" : `${readiness.issues.length} issues`
            }
            tone={readiness.isReady ? "success" : "warning"}
          />
          <Button onClick={saveTemplate}>Save changes</Button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <main className="space-y-5">
          <section className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Template settings</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure the paper header, metadata, instructions, section
                structure, and page rules.
              </p>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <Field label="Template name" className="md:col-span-2">
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                />
              </Field>
              <Field label="Assessment type">
                <select
                  value={draft.type}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      type: event.target
                        .value as SchoolTemplateFormValues["type"],
                    }))
                  }
                  className={fieldClassName}
                >
                  {templateTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatLabel(type)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="School name" className="md:col-span-2">
                <input
                  value={draft.schoolName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      schoolName: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                />
              </Field>
              <Field label="Status">
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      status: event.target
                        .value as SchoolTemplateFormValues["status"],
                    }))
                  }
                  className={fieldClassName}
                >
                  {templateStatuses.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Logo URL" className="md:col-span-3">
                <input
                  value={draft.logoUrl ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      logoUrl: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                  placeholder="Optional logo URL placeholder"
                />
              </Field>
              <Field label="Header text" className="md:col-span-3">
                <input
                  value={draft.headerText}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      headerText: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                />
              </Field>
              <Field label="Footer text" className="md:col-span-3">
                <input
                  value={draft.footerText}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      footerText: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                />
              </Field>
              <Field label="Exam instructions" className="md:col-span-3">
                <textarea
                  value={draft.examInstructions}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      examInstructions: event.target.value,
                    }))
                  }
                  className={textAreaClassName}
                />
              </Field>
              <Field label="Default duration">
                <input
                  type="number"
                  min="1"
                  value={draft.defaultDurationMinutes}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      defaultDurationMinutes: Number(event.target.value),
                    }))
                  }
                  className={fieldClassName}
                />
              </Field>
              <Field label="Default total marks">
                <input
                  type="number"
                  min="0"
                  value={draft.defaultTotalMarks}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      defaultTotalMarks: Number(event.target.value),
                    }))
                  }
                  className={fieldClassName}
                />
              </Field>
              <Field label="Pattern marks">
                <input
                  readOnly
                  value={calculateTemplatePatternMarks(previewTemplate)}
                  className={`${fieldClassName} text-muted-foreground`}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Student metadata fields</h2>
            </div>
            <div className="flex flex-wrap gap-2 p-5">
              {metadataFieldOptions.map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleMetadataField(field)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium ${
                    draft.studentMetadataFields.includes(field)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Section pattern</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Define section names, instructions, and default marks.
                </p>
              </div>
              <Button variant="outline" onClick={addSection}>
                <Plus className="size-4" aria-hidden="true" />
                Section
              </Button>
            </div>
            <div className="divide-y divide-border">
              {draft.sectionPattern.map((section, index) => (
                <div
                  key={`${section.title}-${index}`}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_120px_40px]"
                >
                  <Field label="Title">
                    <input
                      value={section.title}
                      onChange={(event) =>
                        updateSection(index, {
                          ...section,
                          title: event.target.value,
                        })
                      }
                      className={fieldClassName}
                    />
                  </Field>
                  <Field label="Instructions">
                    <input
                      value={section.instructions}
                      onChange={(event) =>
                        updateSection(index, {
                          ...section,
                          instructions: event.target.value,
                        })
                      }
                      className={fieldClassName}
                    />
                  </Field>
                  <Field label="Marks">
                    <input
                      type="number"
                      min="0"
                      value={section.expectedMarks}
                      onChange={(event) =>
                        updateSection(index, {
                          ...section,
                          expectedMarks: Number(event.target.value),
                        })
                      }
                      className={fieldClassName}
                    />
                  </Field>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(index)}
                      aria-label="Remove section"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Page rules</h2>
            </div>
            <div className="p-5">
              <textarea
                value={draft.pageRuleNotes}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    pageRuleNotes: event.target.value,
                  }))
                }
                className={textAreaClassName}
              />
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <TemplatePreview template={previewTemplate} />
          <TemplateReadinessPanel template={previewTemplate} />
          <ImportPlaceholder
            preview={importPreview}
            onMockPreview={() =>
              setImportPreview(
                createMockImportPreview("archived-exam-paper.pdf"),
              )
            }
          />
        </aside>
      </div>
    </div>
  );
}

function TemplateReadinessPanel({
  template,
}: {
  template: SchoolTemplateItem;
}) {
  const readiness = summarizeTemplateReadiness(template);

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Template readiness</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {readiness.isReady
          ? "This template is internally consistent."
          : "Review these settings before approval."}
      </p>
      <div className="mt-4 space-y-2">
        {readiness.issues.length === 0 ? (
          <StatusBadge label="Ready" tone="success" />
        ) : (
          readiness.issues.map((issue) => (
            <div
              key={issue}
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            >
              {issue}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ImportPlaceholder({
  preview,
  onMockPreview,
}: {
  preview: TemplateImportPreview | null;
  onMockPreview: () => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="rounded-md border border-dashed border-border bg-secondary px-4 py-6 text-center">
        <FileUp className="mx-auto size-7 text-muted-foreground" />
        <h2 className="mt-3 text-sm font-semibold">Import from old paper</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Placeholder only. No upload, OCR, or AI extraction is performed.
        </p>
        <Button className="mt-4" variant="outline" onClick={onMockPreview}>
          Preview detected template
        </Button>
      </div>
      {preview ? (
        <div className="mt-4 rounded-md border border-border p-3 text-sm">
          <StatusBadge label={preview.confidenceLabel} tone="warning" />
          <p className="mt-3 font-medium">{preview.detectedName}</p>
          <p className="mt-1 text-muted-foreground">{preview.reviewMessage}</p>
        </div>
      ) : null}
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`grid gap-1 text-xs font-medium text-muted-foreground ${className}`}
    >
      {label}
      {children}
    </label>
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

function statusTone(status: SchoolTemplateItem["status"]) {
  if (status === "ACTIVE") {
    return "success";
  }

  return "neutral";
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toFormValues(template: SchoolTemplateItem): SchoolTemplateFormValues {
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

const fieldClassName =
  "h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

const textAreaClassName =
  "min-h-24 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";
