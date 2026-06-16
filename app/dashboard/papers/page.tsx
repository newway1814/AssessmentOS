import { PaperListClient } from "@/components/papers/paper-list-client";
import {
  paperRepository,
  sortPapersByUpdatedAt,
} from "@/lib/papers/repository";

export const dynamic = "force-dynamic";

export default async function PapersPage() {
  const papers = sortPapersByUpdatedAt(await paperRepository.listPapers());

  return <PaperListClient initialPapers={papers} />;
}
