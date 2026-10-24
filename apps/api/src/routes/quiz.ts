import { Router } from "express";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { generateQuiz } from "../ai/provider.js";
import { getDb } from "../db/index.js";
import { attempts, lessons, quizzes, subjects } from "../db/schema.js";
import {
  ApiError,
  badRequest,
  notFound,
  rejectRequestBody,
  tooManyRequests,
} from "../lib/errors.js";
import {
  scoreAnswers,
  toPublicQuiz,
  type QuizQuestion,
} from "../lib/quiz.js";
import { SlidingWindowLimiter } from "../lib/rateLimit.js";
import { getSessionHash, requireSession } from "../lib/session.js";

const router = Router();
const uuidSchema = z.string().uuid();
const attemptSchema = z
  .object({
    answers: z.array(z.number().int().min(0).max(3)).length(5),
  })
  .strict();

// Ten new quiz generations per session per ten minutes. Cached quizzes do not
// count toward this limit.
const generationLimiter = new SlidingWindowLimiter(10, 10 * 60 * 1000);

function parseId(value: unknown): string {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) throw notFound("That quiz could not be found.");
  return parsed.data;
}

router.post(
  "/lessons/:id/quiz",
  requireSession,
  rejectRequestBody,
  async (req, res, next) => {
    try {
      const lessonId = parseId(req.params.id);
      const sessionHash = getSessionHash(res);
      if (!generationLimiter.allow(sessionHash)) {
        throw tooManyRequests("Please wait a moment before starting another quiz.");
      }

      const db = await getDb();
      const [lesson] = await db
        .select({
          id: lessons.id,
          title: lessons.title,
          contentMd: lessons.contentMd,
          readingMinutes: lessons.readingMinutes,
          version: lessons.version,
        })
        .from(lessons)
        .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
        .where(
          and(
            eq(lessons.id, lessonId),
            eq(lessons.isActive, true),
            eq(subjects.isActive, true),
          ),
        )
        .limit(1);

      if (!lesson) throw notFound("That lesson could not be found.");

      const [cached] = await db
        .select({
          id: quizzes.id,
          lessonId: quizzes.lessonId,
          questions: quizzes.questions,
        })
        .from(quizzes)
        .where(
          and(
            eq(quizzes.lessonId, lesson.id),
            eq(quizzes.lessonVersion, lesson.version),
            eq(quizzes.status, "validated"),
          ),
        )
        .limit(1);

      if (cached) {
        res.setHeader("Cache-Control", "no-store");
        res.json(toPublicQuiz({ ...cached, questions: cached.questions as QuizQuestion[] }));
        return;
      }

      let questions: QuizQuestion[];
      try {
        questions = await generateQuiz(lesson);
      } catch (error) {
        console.error(
          `[${String(res.locals.requestId)}] quiz_generation_failed`,
          error instanceof Error ? error.message : "unknown error",
        );
        throw new ApiError(
          503,
          "We could not build a quiz right now. Please try again.",
        );
      }

      try {
        const inserted = await db
          .insert(quizzes)
          .values({
            id: randomUUID(),
            lessonId: lesson.id,
            lessonVersion: lesson.version,
            questions,
            status: "validated",
          })
          .returning({
            id: quizzes.id,
            lessonId: quizzes.lessonId,
            questions: quizzes.questions,
          });

        const quiz = inserted[0];
        if (!quiz) throw new Error("Quiz insert did not return a row.");

        res.setHeader("Cache-Control", "no-store");
        res.json(toPublicQuiz({ ...quiz, questions: quiz.questions as QuizQuestion[] }));
      } catch (error) {
        // A concurrent request may have cached the same lesson version first.
        const [winner] = await db
          .select({
            id: quizzes.id,
            lessonId: quizzes.lessonId,
            questions: quizzes.questions,
          })
          .from(quizzes)
          .where(
            and(
              eq(quizzes.lessonId, lesson.id),
              eq(quizzes.lessonVersion, lesson.version),
              eq(quizzes.status, "validated"),
            ),
          )
          .limit(1);

        if (winner) {
          res.setHeader("Cache-Control", "no-store");
          res.json(
            toPublicQuiz({
              ...winner,
              questions: winner.questions as QuizQuestion[],
            }),
          );
          return;
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/quizzes/:id/attempts",
  requireSession,
  async (req, res, next) => {
    try {
      const sessionHash = getSessionHash(res);
      const quizId = parseId(req.params.id);
      const parsed = attemptSchema.safeParse(req.body);
      if (!parsed.success) {
        throw badRequest("Select one answer for all five questions.");
      }

      const db = await getDb();
      const [quiz] = await db
        .select({
          id: quizzes.id,
          lessonId: quizzes.lessonId,
          questions: quizzes.questions,
        })
        .from(quizzes)
        .where(and(eq(quizzes.id, quizId), eq(quizzes.status, "validated")))
        .limit(1);

      if (!quiz) throw notFound("That quiz could not be found.");

      const questions = quiz.questions as QuizQuestion[];
      const scored = scoreAnswers(questions, parsed.data.answers);

      const inserted = await db
        .insert(attempts)
        .values({
          id: randomUUID(),
          sessionHash,
          quizId: quiz.id,
          answers: parsed.data.answers,
          score: scored.score,
        })
        .returning({ id: attempts.id, submittedAt: attempts.submittedAt });

      const attempt = inserted[0];
      if (!attempt) throw new Error("Attempt insert did not return a row.");

      res.status(201).json({
        attemptId: attempt.id,
        submittedAt: attempt.submittedAt,
        lessonId: quiz.lessonId,
        score: scored.score,
        total: scored.total,
        results: scored.results,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
