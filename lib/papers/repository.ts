import { drizzlePaperRepository } from "@/lib/papers/drizzle-paper-repository";
import type { PaperBuilderAdapter, PaperBuilderItem } from "@/lib/papers/types";

export const paperRepository: PaperBuilderAdapter = drizzlePaperRepository;

export function sortPapersByUpdatedAt(papers: PaperBuilderItem[]) {
  return [...papers].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}
