"use server";

import { revalidatePath } from "next/cache";

import { templateRepository } from "@/lib/templates/repository";
import type { SchoolTemplateFormValues } from "@/lib/templates/types";

export async function createTemplateAction(input: SchoolTemplateFormValues) {
  const template = await templateRepository.createTemplate(input);
  revalidatePath("/dashboard/templates");
  return template;
}

export async function updateTemplateAction(
  id: string,
  input: SchoolTemplateFormValues,
) {
  const template = await templateRepository.updateTemplate(id, input);
  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/templates/${id}`);
  return template;
}

export async function archiveTemplateAction(id: string) {
  const template = await templateRepository.archiveTemplate(id);
  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/templates/${id}`);
  return template;
}
