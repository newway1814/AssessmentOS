import { mockTemplateRepository } from "@/lib/templates/mock-template-repository";
import type {
  SchoolTemplateAdapter,
  SchoolTemplateItem,
} from "@/lib/templates/types";

export const templateRepository: SchoolTemplateAdapter = mockTemplateRepository;

export function sortTemplatesByUpdatedAt(templates: SchoolTemplateItem[]) {
  return [...templates].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}
