import { TemplateListClient } from "@/components/templates/template-list-client";
import {
  sortTemplatesByUpdatedAt,
  templateRepository,
} from "@/lib/templates/repository";

export default async function TemplatesPage() {
  const templates = sortTemplatesByUpdatedAt(
    await templateRepository.listTemplates(),
  );

  return <TemplateListClient initialTemplates={templates} />;
}
