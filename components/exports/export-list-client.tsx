"use client";

import Link from "next/link";
import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isExportReady } from "@/lib/exports/helpers";
import type {
  ExportRequestItem,
  PersistedPaperExportPreview,
} from "@/lib/exports/types";

export function ExportListClient({
  previews,
  requests,
}: {
  previews: PersistedPaperExportPreview[];
  requests: ExportRequestItem[];
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Export readiness</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {previews.length} papers available for preview
              </p>
            </div>
            <StatusBadge label="Persisted SQLite" tone="success" />
          </div>
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

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Export request history</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {requests.length} persisted export requests in this workspace
          </p>
        </div>
        {requests.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FileText className="mx-auto size-9 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-semibold">
              No export requests yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Open a paper preview and choose an export placeholder to record
              the first request.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-border bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Request</th>
                  <th className="px-4 py-3 font-medium">Format</th>
                  <th className="px-4 py-3 font-medium">Copy</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Readiness</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-secondary/70">
                    <td className="px-5 py-4">
                      <p className="font-medium">{request.paperTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {request.templateName} | {formatDate(request.updatedAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">{request.format}</td>
                    <td className="px-4 py-4">
                      {formatLabel(request.copyType)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge
                        label={formatLabel(request.status)}
                        tone={
                          request.status === "FAILED" ? "warning" : "success"
                        }
                      />
                    </td>
                    <td className="px-4 py-4">
                      {request.ready
                        ? "Ready"
                        : `${request.blockerCount} blockers`}
                    </td>
                    <td className="px-4 py-4">
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/exports/${request.paperId}`}>
                          <Download className="size-4" aria-hidden="true" />
                          Open
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
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
