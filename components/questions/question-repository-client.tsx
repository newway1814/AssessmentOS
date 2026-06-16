"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Edit3,
  FileQuestion,
  Plus,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  questionTypes,
  rightsStatuses,
  sourceTypes,
} from "@/lib/domain/constants";
import { questionSourceInputSchema } from "@/lib/domain/schemas";
import {
  defaultQuestionFilters,
  filterQuestions,
} from "@/lib/questions/filters";
import type {
  QuestionRepositoryFilters,
  QuestionRepositoryFormValues,
  QuestionRepositoryItem,
  QuestionRepositoryMutations,
} from "@/lib/questions/types";

type FormMode = "create" | "edit";

type FormState = {
  mode: FormMode;
  questionId?: string;
  values: QuestionRepositoryFormValues;
};

const emptyFormValues: QuestionRepositoryFormValues = {
  subjectId: "subject-math",
  subjectName: "Mathematics",
  gradeId: "grade-8",
  gradeName: "Grade 8",
  chapterId: "chapter-linear-equations",
  chapterName: "Linear Equations",
  subtopicId: "subtopic-one-variable",
  subtopicName: "Solving one-variable equations",
  type: "SHORT_ANSWER",
  prompt: "",
  marks: 2,
  difficulty: "Foundational",
  source: {
    sourceType: "TEACHER_CREATED",
    title: "",
    author: "",
    owner: "Riverside International School",
    rightsStatus: "VERIFIED",
    usageRights: "",
    attributionText: "",
  },
  answerKey: {
    answer: "",
    explanation: "",
    isComplete: false,
  },
};

export function QuestionRepositoryClient({
  actions,
  initialQuestions,
}: {
  actions: QuestionRepositoryMutations;
  initialQuestions: QuestionRepositoryItem[];
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [filters, setFilters] = useState<QuestionRepositoryFilters>(
    defaultQuestionFilters,
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    initialQuestions[0]?.id ?? "",
  );
  const [formState, setFormState] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredQuestions = useMemo(
    () => filterQuestions(questions, filters),
    [filters, questions],
  );
  const selectedQuestion =
    questions.find((question) => question.id === selectedQuestionId) ??
    filteredQuestions[0];
  const filterOptions = useMemo(
    () => buildFilterOptions(questions),
    [questions],
  );

  function updateFilter<Key extends keyof QuestionRepositoryFilters>(
    key: Key,
    value: QuestionRepositoryFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function startCreate() {
    setError("");
    setFormState({ mode: "create", values: emptyFormValues });
  }

  function startEdit(question: QuestionRepositoryItem) {
    setError("");
    setFormState({
      mode: "edit",
      questionId: question.id,
      values: formValuesFromQuestion(question),
    });
  }

  async function saveQuestion(values: QuestionRepositoryFormValues) {
    setIsSaving(true);
    setError("");

    const parsedSource = questionSourceInputSchema.safeParse(values.source);
    if (!parsedSource.success) {
      setError("Check source and usage-rights metadata before saving.");
      setIsSaving(false);
      return;
    }

    if (values.prompt.trim().length === 0) {
      setError("Question prompt is required.");
      setIsSaving(false);
      return;
    }

    try {
      if (formState?.mode === "edit" && formState.questionId) {
        const updatedQuestion = await actions.updateQuestion(
          formState.questionId,
          values,
        );

        setQuestions((current) =>
          current.map((question) =>
            question.id === updatedQuestion.id ? updatedQuestion : question,
          ),
        );
        setSelectedQuestionId(updatedQuestion.id);
      } else {
        const nextQuestion = await actions.createQuestion(values);

        setQuestions((current) => [nextQuestion, ...current]);
        setSelectedQuestionId(nextQuestion.id);
      }

      setFormState(null);
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function archiveQuestion(questionId: string) {
    setError("");

    try {
      const archivedQuestion = await actions.archiveQuestion(questionId);

      setQuestions((current) =>
        current.map((question) =>
          question.id === archivedQuestion.id ? archivedQuestion : question,
        ),
      );
      setSelectedQuestionId(archivedQuestion.id);
    } catch (archiveError) {
      setError(errorMessage(archiveError));
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Question repository
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Manage reusable question cards
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Create, normalize, review, and organize school-owned assessment
            questions with source, rights, answer key, and validation metadata.
          </p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New question
        </Button>
      </section>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <QuestionFilters
        filters={filters}
        options={filterOptions}
        onChange={updateFilter}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Repository questions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredQuestions.length} of {questions.length} questions shown
              </p>
            </div>
            <StatusBadge label="Persisted SQLite" tone="success" />
          </div>

          {questions.length === 0 ? (
            <EmptyState onCreate={startCreate} />
          ) : filteredQuestions.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <FileQuestion className="mx-auto size-9 text-muted-foreground" />
              <h3 className="mt-4 text-sm font-semibold">
                No matching questions
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Adjust filters or create a new question for this workspace.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-b border-border bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Question</th>
                    <th className="px-4 py-3 font-medium">Taxonomy</th>
                    <th className="px-4 py-3 font-medium">Marks</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Rights</th>
                    <th className="px-4 py-3 font-medium">Answer key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredQuestions.map((question) => (
                    <tr
                      key={question.id}
                      className={`cursor-pointer hover:bg-secondary/70 ${
                        selectedQuestion?.id === question.id
                          ? "bg-secondary"
                          : ""
                      }`}
                      onClick={() => setSelectedQuestionId(question.id)}
                    >
                      <td className="max-w-[360px] px-5 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            label={formatLabel(question.status)}
                            tone={statusTone(question.status)}
                          />
                          <span className="text-xs text-muted-foreground">
                            v{question.versionNumber}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 font-medium">
                          {question.prompt}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatLabel(question.type)}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-muted-foreground">
                        <p className="font-medium text-foreground">
                          {question.subjectName}
                        </p>
                        <p>{question.gradeName}</p>
                        <p>{question.chapterName}</p>
                      </td>
                      <td className="px-4 py-4 align-top">{question.marks}</td>
                      <td className="px-4 py-4 align-top">
                        {formatLabel(question.source.sourceType)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <StatusBadge
                          label={formatLabel(question.source.rightsStatus)}
                          tone={rightsTone(question.source.rightsStatus)}
                        />
                      </td>
                      <td className="px-4 py-4 align-top">
                        {question.answerKey.isComplete ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                            <CheckCircle2
                              className="size-4"
                              aria-hidden="true"
                            />
                            Complete
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Missing</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <QuestionInspector
          question={selectedQuestion}
          onEdit={startEdit}
          onArchive={archiveQuestion}
        />
      </div>

      {formState ? (
        <QuestionFormPanel
          formState={formState}
          isSaving={isSaving}
          onCancel={() => setFormState(null)}
          onSave={saveQuestion}
        />
      ) : null}
    </div>
  );
}

function QuestionFilters({
  filters,
  options,
  onChange,
}: {
  filters: QuestionRepositoryFilters;
  options: ReturnType<typeof buildFilterOptions>;
  onChange: <Key extends keyof QuestionRepositoryFilters>(
    key: Key,
    value: QuestionRepositoryFilters[Key],
  ) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
        <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          <Search className="size-4" aria-hidden="true" />
          <input
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder="Search prompt, source, answer..."
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <SelectFilter
          label="Grade"
          value={filters.grade}
          values={options.grades}
          onChange={(value) => onChange("grade", value)}
        />
        <SelectFilter
          label="Subject"
          value={filters.subject}
          values={options.subjects}
          onChange={(value) => onChange("subject", value)}
        />
        <SelectFilter
          label="Chapter"
          value={filters.chapter}
          values={options.chapters}
          onChange={(value) => onChange("chapter", value)}
        />
        <SelectFilter
          label="Subtopic"
          value={filters.subtopic}
          values={options.subtopics}
          onChange={(value) => onChange("subtopic", value)}
        />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <SelectFilter
          label="Marks"
          value={filters.marks}
          values={options.marks}
          onChange={(value) => onChange("marks", value)}
        />
        <SelectFilter
          label="Difficulty"
          value={filters.difficulty}
          values={options.difficulties}
          onChange={(value) => onChange("difficulty", value)}
        />
        <EnumFilter
          label="Source"
          value={filters.sourceType}
          values={sourceTypes}
          onChange={(value) => onChange("sourceType", value)}
        />
        <EnumFilter
          label="Rights"
          value={filters.rightsStatus}
          values={rightsStatuses}
          onChange={(value) => onChange("rightsStatus", value)}
        />
      </div>
    </section>
  );
}

function SelectFilter({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="ALL">All</option>
        {values.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function EnumFilter<Value extends string>({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: Value | "ALL";
  values: readonly Value[];
  onChange: (value: Value | "ALL") => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Value | "ALL")}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="ALL">All</option>
        {values.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function QuestionInspector({
  question,
  onEdit,
  onArchive,
}: {
  question?: QuestionRepositoryItem;
  onEdit: (question: QuestionRepositoryItem) => void;
  onArchive: (questionId: string) => Promise<void>;
}) {
  if (!question) {
    return (
      <aside className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Select a question to inspect metadata, source rights, versions, and
        answer key.
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Inspector
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-6">
              {question.subjectName} question
            </h2>
          </div>
          <StatusBadge
            label={formatLabel(question.status)}
            tone={statusTone(question.status)}
          />
        </div>
        <p className="mt-4 text-sm leading-6">{question.prompt}</p>
      </div>

      <div className="space-y-5 p-5">
        <MetadataGrid
          items={[
            ["Grade", question.gradeName],
            ["Chapter", question.chapterName ?? "Not set"],
            ["Subtopic", question.subtopicName ?? "Not set"],
            ["Marks", String(question.marks)],
            ["Difficulty", question.difficulty ?? "Not set"],
            ["Type", formatLabel(question.type)],
            ["Version", `v${question.versionNumber}`],
          ]}
        />

        <section>
          <h3 className="text-sm font-semibold">Answer key</h3>
          <div className="mt-2 rounded-md border border-border bg-secondary p-3 text-sm">
            {question.answerKey.isComplete ? (
              <>
                <p className="font-medium">{question.answerKey.answer}</p>
                {question.answerKey.explanation ? (
                  <p className="mt-2 text-muted-foreground">
                    {question.answerKey.explanation}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground">
                Answer key is not complete.
              </p>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Source and rights</h3>
          <div className="mt-2 space-y-2 rounded-md border border-border bg-secondary p-3 text-sm">
            <p className="font-medium">{question.source.title}</p>
            <p className="text-muted-foreground">
              {formatLabel(question.source.sourceType)} |{" "}
              {formatLabel(question.source.rightsStatus)}
            </p>
            <p className="text-muted-foreground">
              {question.source.usageRights}
            </p>
            {question.source.attributionText ? (
              <p className="text-muted-foreground">
                Attribution: {question.source.attributionText}
              </p>
            ) : null}
          </div>
        </section>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(question)}>
            <Edit3 className="size-4" aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => onArchive(question.id)}
            disabled={question.status === "ARCHIVED"}
          >
            <Archive className="size-4" aria-hidden="true" />
            Archive
          </Button>
        </div>
      </div>
    </aside>
  );
}

function QuestionFormPanel({
  formState,
  isSaving,
  onCancel,
  onSave,
}: {
  formState: FormState;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (values: QuestionRepositoryFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState(formState.values);

  function update<Value extends keyof QuestionRepositoryFormValues>(
    key: Value,
    value: QuestionRepositoryFormValues[Value],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateSource<
    Value extends keyof QuestionRepositoryFormValues["source"],
  >(key: Value, value: QuestionRepositoryFormValues["source"][Value]) {
    setValues((current) => ({
      ...current,
      source: { ...current.source, [key]: value },
    }));
  }

  function updateAnswerKey<
    Value extends keyof QuestionRepositoryFormValues["answerKey"],
  >(key: Value, value: QuestionRepositoryFormValues["answerKey"][Value]) {
    setValues((current) => ({
      ...current,
      answerKey: { ...current.answerKey, [key]: value },
    }));
  }

  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">
          {formState.mode === "create" ? "Create question" : "Edit question"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This form writes through the Drizzle-backed question repository and
          keeps source, rights, answer key, and version metadata together.
        </p>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <Field label="Prompt" className="lg:col-span-2">
          <textarea
            value={values.prompt}
            onChange={(event) => update("prompt", event.target.value)}
            className="min-h-28 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Write the question prompt..."
          />
        </Field>
        <Field label="Subject">
          <input
            value={values.subjectName}
            onChange={(event) => update("subjectName", event.target.value)}
            className={fieldClassName}
          />
        </Field>
        <Field label="Grade">
          <input
            value={values.gradeName}
            onChange={(event) => update("gradeName", event.target.value)}
            className={fieldClassName}
          />
        </Field>
        <Field label="Chapter">
          <input
            value={values.chapterName ?? ""}
            onChange={(event) => update("chapterName", event.target.value)}
            className={fieldClassName}
          />
        </Field>
        <Field label="Subtopic">
          <input
            value={values.subtopicName ?? ""}
            onChange={(event) => update("subtopicName", event.target.value)}
            className={fieldClassName}
          />
        </Field>
        <Field label="Question type">
          <select
            value={values.type}
            onChange={(event) =>
              update(
                "type",
                event.target.value as QuestionRepositoryFormValues["type"],
              )
            }
            className={fieldClassName}
          >
            {questionTypes.map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Marks">
          <input
            type="number"
            min="0"
            value={values.marks}
            onChange={(event) => update("marks", Number(event.target.value))}
            className={fieldClassName}
          />
        </Field>
        <Field label="Difficulty">
          <input
            value={values.difficulty ?? ""}
            onChange={(event) => update("difficulty", event.target.value)}
            className={fieldClassName}
          />
        </Field>
        <Field label="Source type">
          <select
            value={values.source.sourceType}
            onChange={(event) =>
              updateSource(
                "sourceType",
                event.target
                  .value as QuestionRepositoryFormValues["source"]["sourceType"],
              )
            }
            className={fieldClassName}
          >
            {sourceTypes.map((sourceType) => (
              <option key={sourceType} value={sourceType}>
                {formatLabel(sourceType)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rights status">
          <select
            value={values.source.rightsStatus}
            onChange={(event) =>
              updateSource(
                "rightsStatus",
                event.target
                  .value as QuestionRepositoryFormValues["source"]["rightsStatus"],
              )
            }
            className={fieldClassName}
          >
            {rightsStatuses.map((rightsStatus) => (
              <option key={rightsStatus} value={rightsStatus}>
                {formatLabel(rightsStatus)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Source title">
          <input
            value={values.source.title}
            onChange={(event) => updateSource("title", event.target.value)}
            className={fieldClassName}
          />
        </Field>
        <Field label="Usage rights" className="lg:col-span-2">
          <textarea
            value={values.source.usageRights}
            onChange={(event) =>
              updateSource("usageRights", event.target.value)
            }
            className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Answer key" className="lg:col-span-2">
          <textarea
            value={values.answerKey.answer}
            onChange={(event) => {
              updateAnswerKey("answer", event.target.value);
              updateAnswerKey(
                "isComplete",
                event.target.value.trim().length > 0,
              );
            }}
            className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Answer explanation" className="lg:col-span-2">
          <textarea
            value={values.answerKey.explanation ?? ""}
            onChange={(event) =>
              updateAnswerKey("explanation", event.target.value)
            }
            className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(values)} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save question"}
        </Button>
      </div>
    </section>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="px-5 py-16 text-center">
      <FileQuestion className="mx-auto size-10 text-muted-foreground" />
      <h3 className="mt-4 text-sm font-semibold">No questions yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Start with a teacher-authored question card. Source and rights metadata
        are required before it can become repository-ready.
      </p>
      <Button className="mt-5" onClick={onCreate}>
        <Plus className="size-4" aria-hidden="true" />
        Create question
      </Button>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`grid gap-1 text-xs font-medium text-muted-foreground ${className}`}
    >
      {label}
      {children}
    </label>
  );
}

function MetadataGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-md border border-border bg-secondary p-3"
        >
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="mt-1 font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClassName = {
    neutral: "border-border bg-secondary text-muted-foreground",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${toneClassName}`}
    >
      {label}
    </span>
  );
}

const fieldClassName =
  "h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

function buildFilterOptions(questions: QuestionRepositoryItem[]) {
  return {
    grades: uniqueSorted(questions.map((question) => question.gradeName)),
    subjects: uniqueSorted(questions.map((question) => question.subjectName)),
    chapters: uniqueSorted(questions.map((question) => question.chapterName)),
    subtopics: uniqueSorted(questions.map((question) => question.subtopicName)),
    marks: uniqueSorted(questions.map((question) => String(question.marks))),
    difficulties: uniqueSorted(
      questions.map((question) => question.difficulty),
    ),
  };
}

function uniqueSorted(values: Array<string | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  ).sort();
}

function formValuesFromQuestion(
  question: QuestionRepositoryItem,
): QuestionRepositoryFormValues {
  return {
    subjectId: question.subjectId,
    subjectName: question.subjectName,
    gradeId: question.gradeId,
    gradeName: question.gradeName,
    chapterId: question.chapterId,
    chapterName: question.chapterName,
    subtopicId: question.subtopicId,
    subtopicName: question.subtopicName,
    type: question.type,
    prompt: question.prompt,
    marks: question.marks,
    difficulty: question.difficulty,
    source: question.source,
    answerKey: question.answerKey,
  };
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(
  status: QuestionRepositoryItem["status"],
): "neutral" | "success" | "warning" | "danger" {
  if (status === "READY") {
    return "success";
  }

  if (status === "NEEDS_REVIEW") {
    return "warning";
  }

  if (status === "ARCHIVED") {
    return "danger";
  }

  return "neutral";
}

function rightsTone(
  status: QuestionRepositoryItem["source"]["rightsStatus"],
): "neutral" | "success" | "warning" | "danger" {
  if (status === "VERIFIED") {
    return "success";
  }

  if (status === "RESTRICTED") {
    return "danger";
  }

  return "warning";
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The question could not be saved. Please try again.";
}
