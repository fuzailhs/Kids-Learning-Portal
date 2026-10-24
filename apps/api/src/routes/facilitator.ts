import { Router } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { config } from "../config.js";
import { getDb } from "../db/index.js";
import { attempts, lessons, quizzes } from "../db/schema.js";
import { unauthorized } from "../lib/errors.js";

const router = Router();

function sameToken(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

/**
 * Should-have requirement FR-017: a protected facilitator CSV export that
 * contains lesson, score, and timestamp only. No session hashes, names, or
 * personal data are included.
 */
router.get("/facilitator/export", async (req, res, next) => {
  try {
    const token = req.header("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
    if (!config.facilitatorToken || !token || !sameToken(token, config.facilitatorToken)) {
      throw unauthorized("Not authorized.");
    }

    const db = await getDb();
    const rows = await db
      .select({
        lessonTitle: lessons.title,
        score: attempts.score,
        submittedAt: attempts.submittedAt,
      })
      .from(attempts)
      .innerJoin(quizzes, eq(attempts.quizId, quizzes.id))
      .innerJoin(lessons, eq(quizzes.lessonId, lessons.id))
      .orderBy(desc(attempts.submittedAt))
      .limit(5000);

    const lines = [
      "lesson,score,submitted_at",
      ...rows.map((row) =>
        [csvCell(row.lessonTitle), csvCell(row.score), csvCell(row.submittedAt)].join(","),
      ),
    ];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="anonymous-attempts.csv"');
    res.setHeader("Cache-Control", "no-store");
    res.send(`${lines.join("\r\n")}\r\n`);
  } catch (error) {
    next(error);
  }
});

export default router;
