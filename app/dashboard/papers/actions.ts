"use server";

import { revalidatePath } from "next/cache";

import { paperRepository } from "@/lib/papers/repository";
import type {
  PaperCreateInput,
  PaperSectionCreateInput,
  PaperSectionUpdateInput,
  PaperUpdateInput,
} from "@/lib/papers/types";

export async function createPaperAction(input: PaperCreateInput) {
  const paper = await paperRepository.createPaper(input);
  revalidatePath("/dashboard/papers");
  return paper;
}

export async function updatePaperAction(id: string, input: PaperUpdateInput) {
  const paper = await paperRepository.updatePaper(id, input);
  revalidatePath("/dashboard/papers");
  revalidatePath(`/dashboard/papers/${id}`);
  return paper;
}

export async function archivePaperAction(id: string) {
  const paper = await paperRepository.archivePaper(id);
  revalidatePath("/dashboard/papers");
  revalidatePath(`/dashboard/papers/${id}`);
  return paper;
}

export async function createPaperSectionAction(
  paperId: string,
  input: PaperSectionCreateInput,
) {
  const paper = await paperRepository.createSection(paperId, input);
  revalidatePath(`/dashboard/papers/${paperId}`);
  return paper;
}

export async function updatePaperSectionAction(
  paperId: string,
  sectionId: string,
  input: PaperSectionUpdateInput,
) {
  const paper = await paperRepository.updateSection(paperId, sectionId, input);
  revalidatePath(`/dashboard/papers/${paperId}`);
  return paper;
}

export async function addQuestionToPaperSectionAction(
  paperId: string,
  sectionId: string,
  questionId: string,
) {
  const paper = await paperRepository.addQuestionToSection(
    paperId,
    sectionId,
    questionId,
  );
  revalidatePath(`/dashboard/papers/${paperId}`);
  return paper;
}

export async function removeQuestionFromPaperSectionAction(
  paperId: string,
  sectionId: string,
  paperQuestionId: string,
) {
  const paper = await paperRepository.removeQuestionFromSection(
    paperId,
    sectionId,
    paperQuestionId,
  );
  revalidatePath(`/dashboard/papers/${paperId}`);
  return paper;
}

export async function moveQuestionInPaperSectionAction(
  paperId: string,
  sectionId: string,
  paperQuestionId: string,
  direction: "up" | "down",
) {
  const paper = await paperRepository.moveQuestionInSection(
    paperId,
    sectionId,
    paperQuestionId,
    direction,
  );
  revalidatePath(`/dashboard/papers/${paperId}`);
  return paper;
}
