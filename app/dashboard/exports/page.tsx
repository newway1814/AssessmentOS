import { ExportListClient } from "@/components/exports/export-list-client";
import { exportPreviewRepository } from "@/lib/exports/repository";

export default async function ExportsPage() {
  const previews = await exportPreviewRepository.listExportPreviews();

  return <ExportListClient previews={previews} />;
}
