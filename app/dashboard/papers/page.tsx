import { PaperListClient } from "@/components/papers/paper-list-client";
import {
  getPaperRepository,
  sortPapersByUpdatedAt,
} from "@/lib/papers/repository";

import { createPaperAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PapersPage() {
  const papers = sortPapersByUpdatedAt(
    await (await getPaperRepository()).listPapers(),
  );

  return (
    <PaperListClient
      initialPapers={papers}
      actions={{ createPaper: createPaperAction }}
    />
  );
}
