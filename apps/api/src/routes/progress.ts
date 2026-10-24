import { Router } from "express";
import { count, desc, eq } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { attempts, lessons, quizzes, subjects } from "../db/schema.js";
import { getSessionHash, requireSession } from "../lib/session.js";

const router = Router();

interface CompletedLesson {
  lessonId: string;
  lessonTitle: string;
  subjectSlug: string;
  subjectTitle: string;
  bestScore: number;
  attempts: number;
  lastSubmittedAt: string;
}

router.get("/progress", requireSession, async (_req, res, next) => {
  try {
    const sessionHash = getSessionHash(res);
    const db = await getDb();

    const rows = await db
      .select({
        id: attempts.id,
        lessonId: lessons.id,
        lessonTitle: lessons.title,
        subjectSlug: subjects.slug,
        subjectTitle: subjects.title,
        score: attempts.score,
        submittedAt: attempts.submittedAt,
      })
      .from(attempts)
      .innerJoin(quizzes, eq(attempts.quizId, quizzes.id))
      .innerJoin(lessons, eq(quizzes.lessonId, lessons.id))
      .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
      .where(eq(attempts.sessionHash, sessionHash))
      .orderBy(desc(attempts.submittedAt))
      .limit(200);

    const totals = await db
      .select({ value: count() })
      .from(attempts)
      .where(eq(attempts.sessionHash, sessionHash));

    const completed = new Map<string, CompletedLesson>();
    for (const row of rows) {
      const existing = completed.get(row.lessonId);
      if (!existing) {
        completed.set(row.lessonId, {
          lessonId: row.lessonId,
          lessonTitle: row.lessonTitle,
          subjectSlug: row.subjectSlug,
          subjectTitle: row.subjectTitle,
          bestScore: row.score,
          attempts: 1,
          lastSubmittedAt: row.submittedAt,
        });
      } else {
        existing.attempts += 1;
        existing.bestScore = Math.max(existing.bestScore, row.score);
        if (row.submittedAt > existing.lastSubmittedAt) {
          existing.lastSubmittedAt = row.submittedAt;
        }
      }
    }

    res.setHeader("Cache-Control", "no-store");
    res.json({
      totalAttempts: Number(totals[0]?.value ?? 0),
      attempts: rows.map(({ score, ...row }) => ({ ...row, score })),
      completedLessons: [...completed.values()].sort((a, b) =>
        b.lastSubmittedAt.localeCompare(a.lastSubmittedAt),
      ),
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/progress", requireSession, async (_req, res, next) => {
  try {
    const sessionHash = getSessionHash(res);
    const db = await getDb();
    await db.delete(attempts).where(eq(attempts.sessionHash, sessionHash));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
