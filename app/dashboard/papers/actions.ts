"use server";

import { revalidatePath } from "next/cache";

import {
  getCurrentWorkspaceContext,
  requirePermission,
} from "@/lib/auth/session";
import { getPaperRepository } from "@/lib/papers/repository";
import type {
  PaperBuilderAdapter,
  PaperCreateInput,
  PaperSectionCreateInput,
  PaperSectionUpdateInput,
  PaperUpdateInput,
} from "@/lib/papers/types";

export async function createPaperAction(input: PaperCreateInput) {
  const paper = await (await getAuthorizedPaperRepository()).createPaper(input);
  revalidatePath("/dashboard/papers");
  return paper;
}

export async function updatePaperAction(id: string, input: PaperUpdateInput) {
  const paper = await (
    await getAuthorizedPaperRepository()
  ).updatePaper(id, input);
  revalidatePath("/dashboard/papers");
  revalidatePath(`/dashboard/papers/${id}`);
  return paper;
}

export async function archivePaperAction(id: string) {
  const paper = await (await getAuthorizedPaperRepository()).archivePaper(id);
  revalidatePath("/dashboard/papers");
  revalidatePath(`/dashboard/papers/${id}`);
  return paper;
}

export async function createPaperSectionAction(
  paperId: string,
  input: PaperSectionCreateInput,
) {
  const paper = await (
    await getAuthorizedPaperRepository()
  ).createSection(paperId, input);
  revalidatePath(`/dashboard/papers/${paperId}`);
  return paper;
}

export async function updatePaperSectionAction(
  paperId: string,
  sectionId: string,
  input: PaperSectionUpdateInput,
) {
  const paper = await (
    await getAuthorizedPaperRepository()
  ).updateSection(paperId, sectionId, input);
  revalidatePath(`/dashboard/papers/${paperId}`);
  return paper;
}

export async function addQuestionToPaperSectionAction(
  paperId: string,
  sectionId: string,
  questionId: string,
) {
  const paper = await (
    await getAuthorizedPaperRepository()
  ).addQuestionToSection(paperId, sectionId, questionId);
  revalidatePath(`/dashboard/papers/${paperId}`);
  return paper;
}

export async function removeQuestionFromPaperSectionAction(
  paperId: string,
  sectionId: string,
  paperQuestionId: string,
) {
  const paper = await (
    await getAuthorizedPaperRepository()
  ).removeQuestionFromSection(paperId, sectionId, paperQuestionId);
  revalidatePath(`/dashboard/papers/${paperId}`);
  return paper;
}

export async function moveQuestionInPaperSectionAction(
  paperId: string,
  sectionId: string,
  paperQuestionId: string,
  direction: "up" | "down",
) {
  const paper = await (
    await getAuthorizedPaperRepository()
  ).moveQuestionInSection(paperId, sectionId, paperQuestionId, direction);
  revalidatePath(`/dashboard/papers/${paperId}`);
  return paper;
}

async function getAuthorizedPaperRepository(): Promise<PaperBuilderAdapter> {
  const context = await getCurrentWorkspaceContext();
  requirePermission(context.role, "canManagePapers");
  return getPaperRepository();
}
