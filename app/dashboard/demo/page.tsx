import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  LibraryBig,
  Upload,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const demoSteps = [
  {
    step: "Step 1",
    title: "Import questions",
    description:
      "Open the intake workspace and choose pasted text, PDF, image, DOCX, school batch, or verified source placeholders.",
    href: "/dashboard/imports",
    icon: Upload,
  },
  {
    step: "Step 2",
    title: "Review normalized cards",
    description:
      "Inspect mocked normalization output, answer keys, taxonomy, source type, and usage-rights metadata before approval.",
    href: "/dashboard/imports",
    icon: CheckCircle2,
  },
  {
    step: "Step 3",
    title: "Open question repository",
    description:
      "Search and filter reusable question cards with grade, subject, marks, difficulty, source, rights, and answer-key metadata.",
    href: "/dashboard/questions",
    icon: LibraryBig,
  },
  {
    step: "Step 4",
    title: "Build paper",
    description:
      "Open the draft paper editor and assemble ordered sections from repository questions.",
    href: "/dashboard/papers/paper-grade-8-algebra-checkpoint",
    secondaryHref: "/dashboard/papers",
    secondaryLabel: "View paper list",
    icon: FileText,
  },
  {
    step: "Step 5",
    title: "Apply school template",
    description:
      "Review the school exam template with header, footer, instructions, student fields, and section pattern.",
    href: "/dashboard/templates/template-riverside-standard-exam",
    secondaryHref: "/dashboard/templates",
    secondaryLabel: "View templates",
    icon: WandSparkles,
  },
  {
    step: "Step 6",
    title: "Export preview and assignment mode",
    description:
      "Preview print-style student and teacher copies, answer key visibility, readiness checks, and assignment-mode placeholders.",
    href: "/dashboard/exports/paper-grade-8-algebra-checkpoint",
    secondaryHref: "/dashboard/exports",
    secondaryLabel: "View export list",
    icon: Download,
  },
];

export default function DemoPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Guided product demo
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            From imported questions to export preview
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            This path shows AssessmentOS as an assessment operating system:
            intake, repository review, paper creation, school templates, and
            export readiness. The workflow data is demo-mode and uses mock
            adapters until Drizzle-backed repositories are connected.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/imports">
            Start demo
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {demoSteps.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-secondary">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {item.step}
                  </p>
                  <h2 className="mt-1 text-base font-semibold">{item.title}</h2>
                </div>
              </div>
              <span className="rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground">
                Demo
              </span>
            </div>
            <p className="mt-4 min-h-16 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href={item.href}>
                  Open step
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              {item.secondaryHref ? (
                <Button asChild variant="outline">
                  <Link href={item.secondaryHref}>{item.secondaryLabel}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Demo mode boundaries</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This demo does not call AI, OCR, upload storage, auth providers, or
          PDF/DOCX rendering. It demonstrates the intended product workflow and
          keeps production-readiness gaps visible.
        </p>
      </section>
    </div>
  );
}
