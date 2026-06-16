"use server";

import { revalidatePath } from "next/cache";

import { questionRepository } from "@/lib/questions/repository";
import type { QuestionRepositoryFormValues } from "@/lib/questions/types";

export async function createQuestionAction(
  input: QuestionRepositoryFormValues,
) {
  const question = await questionRepository.createQuestion(input);
  revalidatePath("/dashboard/questions");
  return question;
}

export async function updateQuestionAction(
  id: string,
  input: QuestionRepositoryFormValues,
) {
  const question = await questionRepository.updateQuestion(id, input);
  revalidatePath("/dashboard/questions");
  return question;
}

export async function archiveQuestionAction(id: string) {
  const question = await questionRepository.archiveQuestion(id);
  revalidatePath("/dashboard/questions");
  return question;
}
