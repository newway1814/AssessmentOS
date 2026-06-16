"use server";

import { revalidatePath } from "next/cache";

import { importRepository } from "@/lib/imports/repository";
import type {
  NewImportDraft,
  NormalizedQuestionCandidateInput,
} from "@/lib/imports/types";

export async function createImportAction(input: NewImportDraft) {
  const batch = await importRepository.createMockImport(input);
  revalidatePath("/dashboard/imports");
  return batch;
}

export async function updateImportCandidateAction(
  importId: string,
  candidateId: string,
  input: NormalizedQuestionCandidateInput,
) {
  const batch = await importRepository.updateCandidate(
    importId,
    candidateId,
    input,
  );
  revalidatePath("/dashboard/imports");
  return batch;
}

export async function approveImportCandidateAction(
  importId: string,
  candidateId: string,
) {
  const batch = await importRepository.approveCandidate(importId, candidateId);
  revalidatePath("/dashboard/imports");
  revalidatePath("/dashboard/questions");
  return batch;
}

export async function rejectImportCandidateAction(
  importId: string,
  candidateId: string,
) {
  const batch = await importRepository.rejectCandidate(importId, candidateId);
  revalidatePath("/dashboard/imports");
  return batch;
}

export async function markImportCandidateForLaterAction(
  importId: string,
  candidateId: string,
) {
  const batch = await importRepository.markCandidateForLater(
    importId,
    candidateId,
  );
  revalidatePath("/dashboard/imports");
  return batch;
}
