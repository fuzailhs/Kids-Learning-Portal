import { Router } from "express";
import { and, asc, count, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db/index.js";
import { lessons, subjects } from "../db/schema.js";
import { notFound } from "../lib/errors.js";

const router = Router();
const uuidSchema = z.string().uuid();
const slugSchema = z.string().regex(/^[a-z0-9-]{1,40}$/);

router.get("/subjects", async (_req, res, next) => {
  try {
    const db = await getDb();
    const rows = await db
      .select({
        id: subjects.id,
        slug: subjects.slug,
        title: subjects.title,
        lessonCount: count(lessons.id),
      })
      .from(subjects)
      .leftJoin(
        lessons,
        and(eq(lessons.subjectId, subjects.id), eq(lessons.isActive, true)),
      )
      .where(eq(subjects.isActive, true))
      .groupBy(subjects.id, subjects.slug, subjects.title)
      .orderBy(asc(subjects.title));

    res.setHeader("Cache-Control", "no-store");
    res.json({
      subjects: rows.map((row) => ({
        ...row,
        lessonCount: Number(row.lessonCount),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/subjects/:slug/lessons", async (req, res, next) => {
  try {
    const parsedSlug = slugSchema.safeParse(req.params.slug);
    if (!parsedSlug.success) throw notFound("That subject could not be found.");

    const db = await getDb();
    const [subject] = await db
      .select({ id: subjects.id, slug: subjects.slug, title: subjects.title })
      .from(subjects)
      .where(and(eq(subjects.slug, parsedSlug.data), eq(subjects.isActive, true)))
      .limit(1);

    if (!subject) throw notFound("That subject could not be found.");

    const lessonRows = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        readingMinutes: lessons.readingMinutes,
        version: lessons.version,
      })
      .from(lessons)
      .where(and(eq(lessons.subjectId, subject.id), eq(lessons.isActive, true)))
      .orderBy(asc(lessons.createdAt), asc(lessons.title));

    res.setHeader("Cache-Control", "no-store");
    res.json({ subject, lessons: lessonRows });
  } catch (error) {
    next(error);
  }
});

router.get("/lessons/:id", async (req, res, next) => {
  try {
    const parsedId = uuidSchema.safeParse(req.params.id);
    if (!parsedId.success) throw notFound("That lesson could not be found.");

    const db = await getDb();
    const [lesson] = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        contentMd: lessons.contentMd,
        readingMinutes: lessons.readingMinutes,
        version: lessons.version,
        subjectId: subjects.id,
        subjectSlug: subjects.slug,
        subjectTitle: subjects.title,
      })
      .from(lessons)
      .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
      .where(
        and(
          eq(lessons.id, parsedId.data),
          eq(lessons.isActive, true),
          eq(subjects.isActive, true),
        ),
      )
      .limit(1);

    if (!lesson) throw notFound("That lesson could not be found.");

    res.setHeader("Cache-Control", "no-store");
    res.json(lesson);
  } catch (error) {
    next(error);
  }
});

export default router;
