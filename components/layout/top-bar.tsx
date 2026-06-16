import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AuthSession } from "@/lib/auth/session";

export function TopBar({ session }: { session: AuthSession }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground lg:max-w-md">
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            Search questions, papers, templates...
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground xl:block">
            <span className="font-medium text-foreground">
              {session.workspaceName}
            </span>
            <span className="mx-2">|</span>
            <span>{formatRole(session.role)}</span>
            {session.isDemoMode ? (
              <>
                <span className="mx-2">|</span>
                <span>Demo session</span>
              </>
            ) : null}
          </div>
          <Button asChild variant="ghost">
            <Link href="/dashboard/demo">Demo</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/imports">Import</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/templates">
              <Plus className="size-4" aria-hidden="true" />
              Template
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function formatRole(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
