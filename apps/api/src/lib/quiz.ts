import { z } from "zod";

const optionSchema = z.string().trim().min(1, "Options cannot be empty.").max(120);

export const quizQuestionSchema = z
  .object({
    prompt: z.string().trim().min(10, "Questions must be complete sentences.").max(300),
    options: z.array(optionSchema).length(4, "Every question needs exactly four options."),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().trim().min(1, "Every question needs an explanation.").max(400),
  })
  .strict()
  .superRefine((question, ctx) => {
    const normalised = question.options.map((option) => option.toLowerCase());
    if (new Set(normalised).size !== normalised.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Answer options must be distinct.",
        path: ["options"],
      });
    }
  });

export const quizSchema = z
  .object({
    questions: z.array(quizQuestionSchema).length(5, "A quiz must contain exactly five questions."),
  })
  .strict();

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export class QuizValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizValidationError";
  }
}

/** Validate untrusted provider output before it can reach a child. */
export function validateQuiz(input: unknown): QuizQuestion[] {
  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new QuizValidationError(issue?.message ?? "The generated quiz was not valid.");
  }

  return parsed.data.questions.map((question) => ({
    prompt: question.prompt.trim(),
    options: question.options.map((option) => option.trim()),
    correctIndex: question.correctIndex,
    explanation: question.explanation.trim(),
  }));
}

export interface ScoredQuestion {
  questionIndex: number;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface ScoreResult {
  score: number;
  total: 5;
  results: ScoredQuestion[];
}

/** Server-side scoring only. The client never sees answers before submitting. */
export function scoreAnswers(questions: QuizQuestion[], answers: number[]): ScoreResult {
  if (questions.length !== 5) {
    throw new Error("Stored quiz does not contain five questions.");
  }
  if (answers.length !== 5) {
    throw new Error("Exactly five answers are required.");
  }
  if (answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
    throw new Error("Every answer must be an option index from 0 to 3.");
  }

  const results = questions.map((question, questionIndex) => {
    const selectedIndex = answers[questionIndex] as number;
    return {
      questionIndex,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect: selectedIndex === question.correctIndex,
      explanation: question.explanation,
    };
  });

  return {
    score: results.filter((result) => result.isCorrect).length,
    total: 5,
    results,
  };
}

export interface PublicQuiz {
  id: string;
  lessonId: string;
  questionCount: number;
  questions: Array<{ prompt: string; options: string[] }>;
}

/** Strip correct answers and explanations until an attempt is submitted. */
export function toPublicQuiz(quiz: {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
}): PublicQuiz {
  return {
    id: quiz.id,
    lessonId: quiz.lessonId,
    questionCount: quiz.questions.length,
    questions: quiz.questions.map((question) => ({
      prompt: question.prompt,
      options: question.options,
    })),
  };
}
