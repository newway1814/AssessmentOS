"use server";

import { revalidatePath } from "next/cache";

import {
  getCurrentWorkspaceContext,
  requirePermission,
} from "@/lib/auth/session";
import { getImportRepository } from "@/lib/imports/repository";
import type { QuestionImportAdapter } from "@/lib/imports/types";
import type {
  NewImportDraft,
  NormalizedQuestionCandidateInput,
} from "@/lib/imports/types";

export async function createImportAction(input: NewImportDraft) {
  const batch = await (
    await getAuthorizedImportRepository()
  ).createMockImport(input);
  revalidatePath("/dashboard/imports");
  return batch;
}

export async function updateImportCandidateAction(
  importId: string,
  candidateId: string,
  input: NormalizedQuestionCandidateInput,
) {
  const batch = await (
    await getAuthorizedImportRepository()
  ).updateCandidate(importId, candidateId, input);
  revalidatePath("/dashboard/imports");
  return batch;
}

export async function approveImportCandidateAction(
  importId: string,
  candidateId: string,
) {
  const batch = await (
    await getAuthorizedImportRepository()
  ).approveCandidate(importId, candidateId);
  revalidatePath("/dashboard/imports");
  revalidatePath("/dashboard/questions");
  return batch;
}

export async function rejectImportCandidateAction(
  importId: string,
  candidateId: string,
) {
  const batch = await (
    await getAuthorizedImportRepository()
  ).rejectCandidate(importId, candidateId);
  revalidatePath("/dashboard/imports");
  return batch;
}

export async function markImportCandidateForLaterAction(
  importId: string,
  candidateId: string,
) {
  const batch = await (
    await getAuthorizedImportRepository()
  ).markCandidateForLater(importId, candidateId);
  revalidatePath("/dashboard/imports");
  return batch;
}

async function getAuthorizedImportRepository(): Promise<QuestionImportAdapter> {
  const context = await getCurrentWorkspaceContext();
  requirePermission(context.role, "canManageImports");
  return getImportRepository();
}
