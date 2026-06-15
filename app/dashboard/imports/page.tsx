import { ImportIntakeClient } from "@/components/imports/import-intake-client";
import { importRepository } from "@/lib/imports/repository";

export default async function ImportsPage() {
  const imports = await importRepository.listImports();

  return <ImportIntakeClient initialImports={imports} />;
}
