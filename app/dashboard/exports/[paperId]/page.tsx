import { notFound } from "next/navigation";

import { ExportPreviewClient } from "@/components/exports/export-preview-client";
import { exportPreviewRepository } from "@/lib/exports/repository";

export default async function ExportPreviewPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const { paperId } = await params;
  const preview = await exportPreviewRepository.getExportPreview(paperId);

  if (!preview) {
    notFound();
  }

  return <ExportPreviewClient preview={preview} />;
}
