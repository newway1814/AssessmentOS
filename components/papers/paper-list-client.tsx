"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { calculatePaperTotalMarks, validatePaper } from "@/lib/papers/helpers";
import type {
  PaperBuilderItem,
  PaperBuilderMutations,
  PaperCreateInput,
} from "@/lib/papers/types";

const emptyPaperInput: PaperCreateInput = {
  title: "",
  gradeId: "grade-8",
  gradeName: "Grade 8",
  subjectId: "subject-math",
  subjectName: "Mathematics",
  durationMinutes: 45,
};

export function PaperListClient({
  actions,
  initialPapers,
}: {
  actions: Pick<PaperBuilderMutations, "createPaper">;
  initialPapers: PaperBuilderItem[];
}) {
  const [papers, setPapers] = useState(initialPapers);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState(emptyPaperInput);
  const [error, setError] = useState("");

  async function createPaper() {
    if (!formValues.title.trim()) {
      setError("Paper title is required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const nextPaper = await actions.createPaper(formValues);

      setPapers((current) => [nextPaper, ...current]);
      setFormValues(emptyPaperInput);
      setIsCreating(false);
    } catch (createError) {
      setError(errorMessage(createError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Paper builder
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Assemble assessment papers
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Create draft papers from repository questions, inspect marks, and
            keep validation visible while the paper takes shape.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="size-4" aria-hidden="true" />
          New paper
        </Button>
      </section>

      {isCreating ? (
        <section className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Create paper</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This creates a persisted draft with an initial Section A.
            </p>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-3">
            <Field label="Title" className="md:col-span-3">
              <input
                value={formValues.title}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className={fieldClassName}
                placeholder="Grade 8 Algebra Midterm"
              />
            </Field>
            <Field label="Subject">
              <input
                value={formValues.subjectName}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    subjectName: event.target.value,
                  }))
                }
                className={fieldClassName}
              />
            </Field>
            <Field label="Grade">
              <input
                value={formValues.gradeName}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    gradeName: event.target.value,
                  }))
                }
                className={fieldClassName}
              />
            </Field>
            <Field label="Duration">
              <input
                type="number"
                min="1"
                value={formValues.durationMinutes}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    durationMinutes: Number(event.target.value),
                  }))
                }
                className={fieldClassName}
              />
            </Field>
          </div>
          {error ? (
            <p className="px-5 pb-2 text-sm text-destructive">{error}</p>
          ) : null}
          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={() => void createPaper()} disabled={isSaving}>
              {isSaving ? "Creating..." : "Create draft"}
            </Button>
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Papers</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {papers.length} draft papers in this workspace
              </p>
            </div>
            <StatusBadge label="Persisted SQLite" tone="success" />
          </div>
        </div>
        {papers.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-semibold">No draft papers yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Start a draft paper, then add repository questions section by
              section.
            </p>
            <Button className="mt-5" onClick={() => setIsCreating(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Create paper
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-border bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Paper</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Marks</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {papers.map((paper) => {
                  const validation = validatePaper(paper);
                  return (
                    <tr key={paper.id} className="hover:bg-secondary/70">
                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/papers/${paper.id}`}
                          className="font-medium hover:underline"
                        >
                          {paper.title}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {paper.sections.length} sections |{" "}
                          {paper.status.toLowerCase()}
                        </p>
                      </td>
                      <td className="px-4 py-4">{paper.gradeName}</td>
                      <td className="px-4 py-4">{paper.subjectName}</td>
                      <td className="px-4 py-4">
                        {calculatePaperTotalMarks(paper.sections)}
                      </td>
                      <td className="px-4 py-4">{paper.durationMinutes} min</td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          label={
                            validation.issues.length
                              ? `${validation.issues.length} issues`
                              : "Ready"
                          }
                          tone={
                            validation.issues.length ? "warning" : "success"
                          }
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
  tone: "success" | "warning";
}) {
  const className =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

const fieldClassName =
  "h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The paper could not be saved. Please try again.";
}
