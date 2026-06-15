import Link from "next/link";
import { ArrowRight, FileCheck2, LibraryBig, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

const foundationItems = [
  {
    title: "Institutional repository",
    description:
      "Question cards, metadata, source context, and validation readiness.",
    icon: LibraryBig,
  },
  {
    title: "Document workflow",
    description:
      "Draft papers, school templates, answer keys, and export readiness.",
    icon: FileCheck2,
  },
  {
    title: "Governed AI boundaries",
    description:
      "Provider-agnostic services with rights metadata and human review.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              AO
            </div>
            <div>
              <p className="text-sm font-semibold">AssessmentOS</p>
              <p className="text-xs text-muted-foreground">
                School assessment operations
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard">
              Open dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Foundation scaffold
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
              Assessment operations software for serious school workflows.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
              A professional foundation for managing question repositories,
              draft papers, school templates, validation states, and governed
              AI-assisted workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">View app shell</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/docs">Read specs</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="border-b border-border pb-4">
              <p className="text-sm font-medium">MVP foundation areas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Placeholder surfaces only. Product features are intentionally
                not implemented.
              </p>
            </div>
            <div className="divide-y divide-border">
              {foundationItems.map((item) => (
                <div key={item.title} className="flex gap-4 py-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary">
                    <item.icon
                      className="size-5 text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
