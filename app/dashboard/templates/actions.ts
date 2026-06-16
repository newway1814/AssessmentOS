"use server";

import { revalidatePath } from "next/cache";

import {
  getCurrentWorkspaceContext,
  requirePermission,
} from "@/lib/auth/session";
import { getTemplateRepository } from "@/lib/templates/repository";
import type { SchoolTemplateFormValues } from "@/lib/templates/types";

export async function createTemplateAction(input: SchoolTemplateFormValues) {
  const template = await (
    await getAuthorizedTemplateRepository()
  ).createTemplate(input);
  revalidatePath("/dashboard/templates");
  return template;
}

export async function updateTemplateAction(
  id: string,
  input: SchoolTemplateFormValues,
) {
  const template = await (
    await getAuthorizedTemplateRepository()
  ).updateTemplate(id, input);
  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/templates/${id}`);
  return template;
}

export async function archiveTemplateAction(id: string) {
  const template = await (
    await getAuthorizedTemplateRepository()
  ).archiveTemplate(id);
  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/templates/${id}`);
  return template;
}

async function getAuthorizedTemplateRepository() {
  const context = await getCurrentWorkspaceContext();
  requirePermission(context.role, "canManageTemplates");
  return getTemplateRepository();
}
