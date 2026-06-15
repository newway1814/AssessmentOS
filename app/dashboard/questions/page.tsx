import { QuestionRepositoryClient } from "@/components/questions/question-repository-client";
import { questionRepository } from "@/lib/questions/repository";

export default async function QuestionsPage() {
  const questions = await questionRepository.listQuestions();

  return <QuestionRepositoryClient initialQuestions={questions} />;
}
