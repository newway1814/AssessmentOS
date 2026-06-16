"use server";

import { revalidatePath } from "next/cache";

import { exportPreviewRepository } from "@/lib/exports/repository";
import type {
  ExportPreviewStateInput,
  ExportStatusInput,
} from "@/lib/exports/types";

export async function updateExportPreviewStateAction(
  paperId: string,
  input: ExportPreviewStateInput,
) {
  const preview = await exportPreviewRepository.updatePreviewState(
    paperId,
    input,
  );
  revalidatePath("/dashboard/exports");
  revalidatePath(`/dashboard/exports/${paperId}`);
  return preview;
}

export async function updateExportStatusAction(
  paperId: string,
  input: ExportStatusInput,
) {
  const preview = await exportPreviewRepository.updateExportStatus(
    paperId,
    input,
  );
  revalidatePath("/dashboard/exports");
  revalidatePath(`/dashboard/exports/${paperId}`);
  return preview;
}
