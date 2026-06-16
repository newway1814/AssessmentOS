import { notFound } from "next/navigation";

import { ExportPreviewClient } from "@/components/exports/export-preview-client";
import { getExportPreviewRepository } from "@/lib/exports/repository";

import {
  updateExportPreviewStateAction,
  updateExportStatusAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function ExportPreviewPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const { paperId } = await params;
  const preview = await (
    await getExportPreviewRepository()
  ).getExportPreview(paperId);

  if (!preview) {
    notFound();
  }

  return (
    <ExportPreviewClient
      preview={preview}
      actions={{
        updatePreviewState: updateExportPreviewStateAction,
        updateExportStatus: updateExportStatusAction,
      }}
    />
  );
}
