import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();

  return <AppShell session={session}>{children}</AppShell>;
}
