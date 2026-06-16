import type { SchoolTemplateItem } from "@/lib/templates/types";

export function TemplatePreview({
  template,
}: {
  template: SchoolTemplateItem;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mx-auto max-w-3xl border border-border bg-background px-8 py-7 shadow-sm">
        <header className="border-b border-border pb-5">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-sm font-semibold">
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
                {template.type.toLowerCase().replace("_", " ")} |{" "}
                {template.defaultDurationMinutes} minutes |{" "}
                {template.defaultTotalMarks} marks
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

        <section className="space-y-5 py-5">
          {template.sectionPattern.map((section) => (
            <div key={section.title}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">{section.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.instructions}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {section.expectedMarks} marks
                </span>
              </div>
              <div className="mt-4 rounded-md border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                Questions will render here when this template is applied to a
                paper.
              </div>
            </div>
          ))}
        </section>

        <footer className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
          {template.footerText}
        </footer>
      </div>
    </div>
  );
}
