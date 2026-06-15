import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="flex min-w-0 flex-col">
          <TopBar />
          <main className="flex-1 bg-background px-5 py-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
