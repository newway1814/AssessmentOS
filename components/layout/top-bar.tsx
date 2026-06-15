import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TopBar() {
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
          <Button variant="outline" disabled>
            Import
          </Button>
          <Button asChild>
            <Link href="/dashboard/papers">
              <Plus className="size-4" aria-hidden="true" />
              Paper
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
