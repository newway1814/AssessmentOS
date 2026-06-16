import { QuestionRepositoryClient } from "@/components/questions/question-repository-client";
import { questionRepository } from "@/lib/questions/repository";

import {
  archiveQuestionAction,
  createQuestionAction,
  updateQuestionAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const questions = await questionRepository.listQuestions();

  return (
    <QuestionRepositoryClient
      initialQuestions={questions}
      actions={{
        createQuestion: createQuestionAction,
        updateQuestion: updateQuestionAction,
        archiveQuestion: archiveQuestionAction,
      }}
    />
  );
}
