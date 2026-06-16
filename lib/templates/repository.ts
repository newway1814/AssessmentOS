import { getCurrentWorkspaceContext } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { createDrizzleTemplateRepository } from "@/lib/templates/drizzle-template-repository";
import type {
  SchoolTemplateAdapter,
  SchoolTemplateItem,
} from "@/lib/templates/types";

export async function getTemplateRepository(): Promise<SchoolTemplateAdapter> {
  return createDrizzleTemplateRepository(
    db,
    await getCurrentWorkspaceContext(),
  );
}

export function sortTemplatesByUpdatedAt(templates: SchoolTemplateItem[]) {
  return [...templates].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}
