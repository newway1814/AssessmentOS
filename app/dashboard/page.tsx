import { ArrowUpRight, FileText, LibraryBig, ShieldCheck } from "lucide-react";

const overview = [
  { label: "Repository", value: "Not configured", icon: LibraryBig },
  { label: "Draft papers", value: "Placeholder", icon: FileText },
  { label: "Validation", value: "Spec only", icon: ShieldCheck },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Dashboard placeholder
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            AssessmentOS workspace
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            This shell establishes navigation, hierarchy, and surface structure
            before product features are implemented.
          </p>
        </div>
        <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
          No database, auth, AI, uploads, or exports are connected.
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {overview.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-secondary">
                <item.icon className="size-5" aria-hidden="true" />
              </div>
              <ArrowUpRight
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="mt-5 text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Workspace activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Static placeholder for future audit-backed activity.
            </p>
          </div>
          <div className="divide-y divide-border">
            {[
              "Question repository planned",
              "Template setup planned",
              "Validation rules planned",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between px-5 py-4 text-sm"
              >
                <span>{item}</span>
                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                  Spec
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Inspector placeholder</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Future selected records will show metadata, source rights,
            validation issues, comments, and audit context here.
          </p>
        </aside>
      </section>
    </div>
  );
}
