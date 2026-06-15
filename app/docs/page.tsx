import Link from "next/link";

const specReferences = [
  ["Product requirements", "/specs/PRD.md"],
  ["Architecture", "/specs/ARCHITECTURE.md"],
  ["Data model", "/specs/DATA_MODEL.md"],
  ["UI system", "/specs/UI_SYSTEM.md"],
  ["TypeScript standards", "/specs/TYPESCRIPT_STANDARDS.md"],
  ["MVP scope", "/specs/MVP_SCOPE.md"],
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          AssessmentOS
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-normal">
          Project specs
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This app foundation is intentionally thin. Product behavior lives in
          the repository specs and should be updated before implementation
          changes.
        </p>
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-card">
          {specReferences.map(([label, path]) => (
            <div
              key={path}
              className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
            >
              <span className="font-medium">{label}</span>
              <code className="text-xs text-muted-foreground">{path}</code>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
