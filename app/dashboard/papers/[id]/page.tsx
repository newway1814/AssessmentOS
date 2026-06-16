import { notFound } from "next/navigation";

import { PaperEditorClient } from "@/components/papers/paper-editor-client";
import { paperRepository } from "@/lib/papers/repository";
import { questionRepository } from "@/lib/questions/repository";

import {
  addQuestionToPaperSectionAction,
  archivePaperAction,
  createPaperSectionAction,
  moveQuestionInPaperSectionAction,
  removeQuestionFromPaperSectionAction,
  updatePaperAction,
  updatePaperSectionAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function PaperEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [paper, questions] = await Promise.all([
    paperRepository.getPaper(id),
    questionRepository.listQuestions(),
  ]);

  if (!paper) {
    notFound();
  }

  return (
    <PaperEditorClient
      initialPaper={paper}
      repositoryQuestions={questions}
      actions={{
        updatePaper: updatePaperAction,
        archivePaper: archivePaperAction,
        createSection: createPaperSectionAction,
        updateSection: updatePaperSectionAction,
        addQuestionToSection: addQuestionToPaperSectionAction,
        removeQuestionFromSection: removeQuestionFromPaperSectionAction,
        moveQuestionInSection: moveQuestionInPaperSectionAction,
      }}
    />
  );
}
