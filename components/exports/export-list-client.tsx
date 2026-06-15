"use client";

import Link from "next/link";
import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isExportReady } from "@/lib/exports/helpers";
import type { PaperExportPreview } from "@/lib/exports/types";

export function ExportListClient({
  previews,
}: {
  previews: PaperExportPreview[];
}) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Export preview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Review papers before export
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Check paper readiness, preview student and teacher copies, and keep
            export actions explicit while PDF/DOCX rendering remains a
            placeholder.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Export readiness</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {previews.length} papers available for preview
          </p>
        </div>
        {previews.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-semibold">No papers available</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Create a draft paper before opening export preview.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-border bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Paper</th>
                  <th className="px-4 py-3 font-medium">Template</th>
                  <th className="px-4 py-3 font-medium">Marks</th>
                  <th className="px-4 py-3 font-medium">Readiness</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {previews.map((preview) => {
                  const ready = isExportReady(preview.checklist);
                  return (
                    <tr
                      key={preview.paper.id}
                      className="hover:bg-secondary/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{preview.paper.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {preview.paper.gradeName} |{" "}
                          {preview.paper.subjectName}
                        </p>
                      </td>
                      <td className="px-4 py-4">{preview.template.name}</td>
                      <td className="px-4 py-4">{preview.totalMarks}</td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          label={
                            ready
                              ? "Ready"
                              : `${preview.checklist.filter((item) => !item.isReady).length} blockers`
                          }
                          tone={ready ? "success" : "warning"}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Button asChild variant="outline">
                          <Link href={`/dashboard/exports/${preview.paper.id}`}>
                            <Download className="size-4" aria-hidden="true" />
                            Preview
                          </Link>
                        </Button>
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
