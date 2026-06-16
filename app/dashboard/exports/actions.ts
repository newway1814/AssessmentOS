"use server";

import { revalidatePath } from "next/cache";

import {
  getCurrentWorkspaceContext,
  requirePermission,
} from "@/lib/auth/session";
import { getExportPreviewRepository } from "@/lib/exports/repository";
import type {
  ExportPreviewStateInput,
  ExportStatusInput,
} from "@/lib/exports/types";

export async function updateExportPreviewStateAction(
  paperId: string,
  input: ExportPreviewStateInput,
) {
  const context = await getCurrentWorkspaceContext();
  requirePermission(context.role, "canCreateExports");

  const preview = await (
    await getExportPreviewRepository()
  ).updatePreviewState(paperId, input);
  revalidatePath("/dashboard/exports");
  revalidatePath(`/dashboard/exports/${paperId}`);
  return preview;
}

export async function updateExportStatusAction(
  paperId: string,
  input: ExportStatusInput,
) {
  const context = await getCurrentWorkspaceContext();
  requirePermission(context.role, "canCreateExports");

  const preview = await (
    await getExportPreviewRepository()
  ).updateExportStatus(paperId, input);
  revalidatePath("/dashboard/exports");
  revalidatePath(`/dashboard/exports/${paperId}`);
  return preview;
}
