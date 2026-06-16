import Link from "next/link";
import {
  ArrowRight,
  Database,
  Download,
  FileText,
  LibraryBig,
  Upload,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const workflow = [
  {
    step: "01",
    title: "Import questions",
    description:
      "Start with pasted text, documents, scans, school batches, or verified external source placeholders.",
    href: "/dashboard/imports",
    cta: "Open imports",
    icon: Upload,
  },
  {
    step: "02",
    title: "Review repository",
    description:
      "Review normalized question cards, metadata, answer keys, source records, and rights status.",
    href: "/dashboard/questions",
    cta: "Review questions",
    icon: LibraryBig,
  },
  {
    step: "03",
    title: "Build paper",
    description:
      "Assemble draft papers from repository questions with sections, order, marks, and validation feedback.",
    href: "/dashboard/papers",
    cta: "Build paper",
    icon: FileText,
  },
  {
    step: "04",
    title: "Apply template",
    description:
      "Use school-specific headers, instructions, student metadata fields, section patterns, and page notes.",
    href: "/dashboard/templates",
    cta: "Manage templates",
    icon: WandSparkles,
  },
  {
    step: "05",
    title: "Export preview",
    description:
      "Preview student and teacher copies, answer keys, assignment mode, and export readiness before rendering.",
    href: "/dashboard/exports",
    cta: "Preview exports",
    icon: Download,
  },
];

const statusItems = [
  ["Questions", "Mock repository UI"],
  ["Database", "Drizzle SQLite scaffold"],
  ["Exports", "Preview only"],
  ["Auth", "Not connected"],
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Riverside School workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Assessment workflow command center
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Follow the demo path from intake through repository review, paper
            assembly, school templates, and export preview. The product surface
            is usable with mock workflow adapters while persistence is prepared
            behind Drizzle and SQLite.
          </p>
        </div>
        <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
          Demo mode · Mock workflow data · SQLite scaffold ready
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workflow.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-lg border border-border bg-card p-5 shadow-sm hover:bg-secondary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-secondary group-hover:bg-background">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <span className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
                  {item.step}
                </span>
              </div>
              <h2 className="mt-5 text-base font-semibold">{item.title}</h2>
              <p className="mt-2 min-h-20 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                {item.cta}
                <ArrowRight
                  className="size-4 transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>

        <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-secondary">
              <Database className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">MVP readiness</h2>
              <p className="text-sm text-muted-foreground">
                Current integration status
              </p>
            </div>
          </div>
          <dl className="mt-5 space-y-3">
            {statusItems.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <Button asChild className="mt-5 w-full">
            <Link href="/dashboard/demo">
              Open guided demo
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Recommended next steps</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Production readiness should move one repository boundary at a
              time.
            </p>
          </div>
          <div className="divide-y divide-border">
            {[
              "Connect questions to Drizzle-backed repositories first.",
              "Persist import candidates before any real OCR or AI calls.",
              "Record validation results, export requests, and audit logs for every mutation.",
            ].map((item) => (
              <div key={item} className="px-5 py-4 text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Production audit</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The current MVP is intentionally honest about what is real and what
            is mocked. Review the readiness audit before starting persistence,
            auth, uploads, AI, or export rendering.
          </p>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link href="/docs">Open docs</Link>
          </Button>
        </aside>
      </section>
    </div>
  );
}
