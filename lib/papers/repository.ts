import { mockPaperRepository } from "@/lib/papers/mock-paper-repository";
import type { PaperBuilderAdapter, PaperBuilderItem } from "@/lib/papers/types";

export const paperRepository: PaperBuilderAdapter = mockPaperRepository;

export function sortPapersByUpdatedAt(papers: PaperBuilderItem[]) {
  return [...papers].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}
