import { ImportIntakeClient } from "@/components/imports/import-intake-client";
import { getImportRepository } from "@/lib/imports/repository";

import {
  approveImportCandidateAction,
  createImportAction,
  markImportCandidateForLaterAction,
  rejectImportCandidateAction,
  updateImportCandidateAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ImportsPage() {
  const imports = await (await getImportRepository()).listImports();

  return (
    <ImportIntakeClient
      initialImports={imports}
      actions={{
        createMockImport: createImportAction,
        updateCandidate: updateImportCandidateAction,
        approveCandidate: approveImportCandidateAction,
        rejectCandidate: rejectImportCandidateAction,
        markCandidateForLater: markImportCandidateForLaterAction,
      }}
    />
  );
}
