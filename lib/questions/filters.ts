import type {
  QuestionRepositoryFilters,
  QuestionRepositoryItem,
} from "@/lib/questions/types";

export const defaultQuestionFilters: QuestionRepositoryFilters = {
  search: "",
  grade: "ALL",
  subject: "ALL",
  chapter: "ALL",
  subtopic: "ALL",
  marks: "ALL",
  difficulty: "ALL",
  sourceType: "ALL",
  rightsStatus: "ALL",
};

export function filterQuestions(
  questions: QuestionRepositoryItem[],
  filters: QuestionRepositoryFilters,
) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return questions.filter((question) => {
    const searchable = [
      question.prompt,
      question.subjectName,
      question.gradeName,
      question.chapterName,
      question.subtopicName,
      question.source.title,
      question.answerKey.answer,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!normalizedSearch || searchable.includes(normalizedSearch)) &&
      (filters.grade === "ALL" || question.gradeName === filters.grade) &&
      (filters.subject === "ALL" || question.subjectName === filters.subject) &&
      (filters.chapter === "ALL" || question.chapterName === filters.chapter) &&
      (filters.subtopic === "ALL" ||
        question.subtopicName === filters.subtopic) &&
      (filters.marks === "ALL" || String(question.marks) === filters.marks) &&
      (filters.difficulty === "ALL" ||
        question.difficulty === filters.difficulty) &&
      (filters.sourceType === "ALL" ||
        question.source.sourceType === filters.sourceType) &&
      (filters.rightsStatus === "ALL" ||
        question.source.rightsStatus === filters.rightsStatus)
    );
  });
}
