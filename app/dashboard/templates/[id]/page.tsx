import { notFound } from "next/navigation";

import { TemplateEditorClient } from "@/components/templates/template-editor-client";
import { getTemplateRepository } from "@/lib/templates/repository";

import { archiveTemplateAction, updateTemplateAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await (await getTemplateRepository()).getTemplate(id);

  if (!template) {
    notFound();
  }

  return (
    <TemplateEditorClient
      initialTemplate={template}
      actions={{
        updateTemplate: updateTemplateAction,
        archiveTemplate: archiveTemplateAction,
      }}
    />
  );
}
