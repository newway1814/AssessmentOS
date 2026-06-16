import { TemplateListClient } from "@/components/templates/template-list-client";
import {
  getTemplateRepository,
  sortTemplatesByUpdatedAt,
} from "@/lib/templates/repository";

import { createTemplateAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = sortTemplatesByUpdatedAt(
    await (await getTemplateRepository()).listTemplates(),
  );

  return (
    <TemplateListClient
      initialTemplates={templates}
      actions={{ createTemplate: createTemplateAction }}
    />
  );
}
