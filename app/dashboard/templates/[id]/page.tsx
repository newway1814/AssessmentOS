import { notFound } from "next/navigation";

import { TemplateEditorClient } from "@/components/templates/template-editor-client";
import { templateRepository } from "@/lib/templates/repository";

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await templateRepository.getTemplate(id);

  if (!template) {
    notFound();
  }

  return <TemplateEditorClient initialTemplate={template} />;
}
