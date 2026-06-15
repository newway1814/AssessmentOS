"use client";

import Link from "next/link";
import { useState } from "react";
import { FileUp, Plus, WandSparkles } from "lucide-react";

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
  TemplateImportPreview,
} from "@/lib/templates/types";

const emptyTemplate: SchoolTemplateFormValues = {
  name: "",
  type: "EXAM",
  schoolName: "Riverside International School",
  logoUrl: "",
  headerText: "End of Term Assessment",
  footerText:
    "This paper is confidential and intended for internal school use.",
  examInstructions: "Answer all questions. Show working where appropriate.",
  studentMetadataFields: ["Name", "Roll number", "Class", "Section", "Date"],
  defaultDurationMinutes: 90,
  defaultTotalMarks: 50,
  sectionPattern: [
    {
      title: "Section A",
      instructions: "Answer all questions.",
      expectedMarks: 20,
    },
    {
      title: "Section B",
      instructions: "Show working for long-answer questions.",
      expectedMarks: 30,
    },
  ],
  pageRuleNotes:
    "A4 layout with school header on first page and page numbers in footer.",
  status: "DRAFT",
};

export function TemplateListClient({
  initialTemplates,
}: {
  initialTemplates: SchoolTemplateItem[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [isCreating, setIsCreating] = useState(false);
  const [formValues, setFormValues] = useState(emptyTemplate);
  const [importPreview, setImportPreview] =
    useState<TemplateImportPreview | null>(null);
  const [error, setError] = useState("");
  const selectedTemplate = templates[0];

  function createTemplate() {
    if (!formValues.name.trim()) {
      setError("Template name is required.");
      return;
    }

    const nextTemplate: SchoolTemplateItem = {
      id: `template-${Date.now()}`,
      schoolId: "school-riverside",
      workspaceId: "workspace-academic-coordination",
      ...formValues,
      versionNumber: 1,
      updatedAt: new Date().toISOString(),
    };

    setTemplates((current) => [nextTemplate, ...current]);
    setFormValues(emptyTemplate);
    setIsCreating(false);
    setError("");
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            School templates
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Manage paper templates
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Define school headers, metadata fields, instructions, section
            patterns, and page rules before papers move toward export.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportPreview(null)}>
            <FileUp className="size-4" aria-hidden="true" />
            Import old paper
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New template
          </Button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <main className="space-y-5">
          <ImportPlaceholder
            preview={importPreview}
            onMockPreview={() =>
              setImportPreview(createMockImportPreview("old-midterm-paper.pdf"))
            }
          />

          {isCreating ? (
            <TemplateCreatePanel
              values={formValues}
              error={error}
              onChange={setFormValues}
              onCancel={() => setIsCreating(false)}
              onCreate={createTemplate}
            />
          ) : null}

          <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Templates</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {templates.length} templates in this workspace
              </p>
            </div>
            {templates.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <WandSparkles className="mx-auto size-10 text-muted-foreground" />
                <h3 className="mt-4 text-sm font-semibold">No templates yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Create a school template or review a mocked import from an old
                  paper.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="border-b border-border bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Template</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Defaults</th>
                      <th className="px-4 py-3 font-medium">Readiness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {templates.map((template) => {
                      const readiness = summarizeTemplateReadiness(template);
                      return (
                        <tr key={template.id} className="hover:bg-secondary/70">
                          <td className="px-5 py-4">
                            <Link
                              href={`/dashboard/templates/${template.id}`}
                              className="font-medium hover:underline"
                            >
                              {template.name}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                              v{template.versionNumber} · {template.schoolName}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge
                              label={formatLabel(template.type)}
                              tone="neutral"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge
                              label={formatLabel(template.status)}
                              tone={statusTone(template.status)}
                            />
                          </td>
                          <td className="px-4 py-4">
                            {template.defaultDurationMinutes} min ·{" "}
                            {template.defaultTotalMarks} marks
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge
                              label={
                                readiness.isReady
                                  ? "Ready"
                                  : `${readiness.issues.length} issues`
                              }
                              tone={readiness.isReady ? "success" : "warning"}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-5">
          {selectedTemplate ? (
            <>
              <TemplateInspector template={selectedTemplate} />
              <TemplatePreview template={selectedTemplate} />
            </>
          ) : (
            <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
              Create or import a template to preview its school paper layout.
            </div>
          )}
        </aside>
      </div>
    </div>
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
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-lg border border-dashed border-border bg-secondary px-5 py-8 text-center">
          <FileUp className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-4 text-sm font-semibold">Import from old paper</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Dropzone placeholder only. No file upload, OCR, or AI extraction is
            running in this MVP.
          </p>
          <Button className="mt-5" variant="outline" onClick={onMockPreview}>
            Generate mock detection
          </Button>
        </div>
        <div className="rounded-lg border border-border p-4">
          {preview ? (
            <div>
              <StatusBadge label={preview.confidenceLabel} tone="warning" />
              <h3 className="mt-3 text-sm font-semibold">
                {preview.detectedName}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Source: {preview.filename}
              </p>
              <div className="mt-4 space-y-2">
                {preview.detectedSections.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-md border border-border bg-secondary p-3 text-sm"
                  >
                    <p className="font-medium">{section.title}</p>
                    <p className="mt-1 text-muted-foreground">
                      {section.instructions} · {section.expectedMarks} marks
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {preview.reviewMessage}
              </p>
            </div>
          ) : (
            <div className="flex h-full items-center text-sm text-muted-foreground">
              Mock detection preview appears here after the placeholder action.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TemplateCreatePanel({
  values,
  error,
  onChange,
  onCancel,
  onCreate,
}: {
  values: SchoolTemplateFormValues;
  error: string;
  onChange: (values: SchoolTemplateFormValues) => void;
  onCancel: () => void;
  onCreate: () => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Create template</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start with a structured school exam template. Details can be edited on
          the template page.
        </p>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-3">
        <Field label="Template name" className="md:col-span-3">
          <input
            value={values.name}
            onChange={(event) =>
              onChange({ ...values, name: event.target.value })
            }
            className={fieldClassName}
            placeholder="Grade 8 Midterm Paper"
          />
        </Field>
        <Field label="Assessment type">
          <select
            value={values.type}
            onChange={(event) =>
              onChange({
                ...values,
                type: event.target.value as SchoolTemplateFormValues["type"],
              })
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
        <Field label="Status">
          <select
            value={values.status}
            onChange={(event) =>
              onChange({
                ...values,
                status: event.target
                  .value as SchoolTemplateFormValues["status"],
              })
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
        <Field label="Default duration">
          <input
            type="number"
            min="1"
            value={values.defaultDurationMinutes}
            onChange={(event) =>
              onChange({
                ...values,
                defaultDurationMinutes: Number(event.target.value),
              })
            }
            className={fieldClassName}
          />
        </Field>
      </div>
      {error ? (
        <p className="px-5 pb-2 text-sm text-destructive">{error}</p>
      ) : null}
      <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onCreate}>Create template</Button>
      </div>
    </section>
  );
}

function TemplateInspector({ template }: { template: SchoolTemplateItem }) {
  const readiness = summarizeTemplateReadiness(template);

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Inspector
          </p>
          <h2 className="mt-2 text-lg font-semibold">{template.name}</h2>
        </div>
        <StatusBadge
          label={formatLabel(template.status)}
          tone={statusTone(template.status)}
        />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <MetadataItem label="Type" value={formatLabel(template.type)} />
        <MetadataItem
          label="Duration"
          value={`${template.defaultDurationMinutes} min`}
        />
        <MetadataItem
          label="Total marks"
          value={`${template.defaultTotalMarks}`}
        />
        <MetadataItem
          label="Pattern marks"
          value={`${calculateTemplatePatternMarks(template)}`}
        />
      </dl>
      <div className="mt-5 rounded-md border border-border bg-secondary p-3">
        <p className="text-sm font-medium">
          {readiness.isReady ? "Template is ready" : "Needs review"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {readiness.isReady
            ? "Defaults, instructions, metadata, and section marks are aligned."
            : readiness.issues.join(" ")}
        </p>
      </div>
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

const fieldClassName =
  "h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";
