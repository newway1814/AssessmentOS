"use server";

import { revalidatePath } from "next/cache";

import {
  getCurrentWorkspaceContext,
  requirePermission,
} from "@/lib/auth/session";
import { getQuestionRepository } from "@/lib/questions/repository";
import type { QuestionRepositoryFormValues } from "@/lib/questions/types";

export async function createQuestionAction(
  input: QuestionRepositoryFormValues,
) {
  const context = await getCurrentWorkspaceContext();
  requirePermission(context.role, "canManageQuestions");

  const question = await (await getQuestionRepository()).createQuestion(input);
  revalidatePath("/dashboard/questions");
  return question;
}

export async function updateQuestionAction(
  id: string,
  input: QuestionRepositoryFormValues,
) {
  const context = await getCurrentWorkspaceContext();
  requirePermission(context.role, "canManageQuestions");

  const question = await (
    await getQuestionRepository()
  ).updateQuestion(id, input);
  revalidatePath("/dashboard/questions");
  return question;
}

export async function archiveQuestionAction(id: string) {
  const context = await getCurrentWorkspaceContext();
  requirePermission(context.role, "canManageQuestions");

  const question = await (await getQuestionRepository()).archiveQuestion(id);
  revalidatePath("/dashboard/questions");
  return question;
}
