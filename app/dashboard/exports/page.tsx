import { ExportListClient } from "@/components/exports/export-list-client";
import { getExportPreviewRepository } from "@/lib/exports/repository";

export const dynamic = "force-dynamic";

export default async function ExportsPage() {
  const exportPreviewRepository = await getExportPreviewRepository();
  const [previews, requests] = await Promise.all([
    exportPreviewRepository.listExportPreviews(),
    exportPreviewRepository.listExportRequests(),
  ]);

  return <ExportListClient previews={previews} requests={requests} />;
}
