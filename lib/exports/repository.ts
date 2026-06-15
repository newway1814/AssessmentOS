import { paperRepository } from "@/lib/papers/repository";
import { templateRepository } from "@/lib/templates/repository";
import { buildExportPreview } from "@/lib/exports/helpers";
import type { PaperExportPreview } from "@/lib/exports/types";

export type ExportPreviewAdapter = {
  listExportPreviews(): Promise<PaperExportPreview[]>;
  getExportPreview(paperId: string): Promise<PaperExportPreview | undefined>;
};

export const exportPreviewRepository: ExportPreviewAdapter = {
  async listExportPreviews() {
    const [papers, templates] = await Promise.all([
      paperRepository.listPapers(),
      templateRepository.listTemplates(),
    ]);
    const template = templates[0];

    if (!template) {
      return [];
    }

    return papers.map((paper) => buildExportPreview({ paper, template }));
  },

  async getExportPreview(paperId) {
    const [paper, templates] = await Promise.all([
      paperRepository.getPaper(paperId),
      templateRepository.listTemplates(),
    ]);
    const template = templates[0];

    if (!paper || !template) {
      return undefined;
    }

    return buildExportPreview({ paper, template });
  },
};
