import { getCurrentWorkspaceContext } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { createDrizzlePaperRepository } from "@/lib/papers/drizzle-paper-repository";
import type { PaperBuilderAdapter, PaperBuilderItem } from "@/lib/papers/types";

export async function getPaperRepository(): Promise<PaperBuilderAdapter> {
  return createDrizzlePaperRepository(db, await getCurrentWorkspaceContext());
}

export function sortPapersByUpdatedAt(papers: PaperBuilderItem[]) {
  return [...papers].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}
