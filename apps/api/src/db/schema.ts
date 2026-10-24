import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { QuizQuestion } from "../lib/quiz.js";

export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  title: varchar("title", { length: 80 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }).notNull(),
    contentMd: text("content_md").notNull(),
    readingMinutes: integer("reading_minutes").notNull(),
    version: integer("version").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("lessons_subject_idx").on(table.subjectId)],
);

export const quizzes = pgTable(
  "quizzes",
  {
    id: uuid("id").primaryKey(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    lessonVersion: integer("lesson_version").notNull(),
    questions: jsonb("questions").$type<QuizQuestion[]>().notNull(),
    status: varchar("status", { length: 16 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("quizzes_valid_lesson_version_idx")
      .on(table.lessonId, table.lessonVersion)
      .where(sql`${table.status} = 'validated'`),
    index("quizzes_lesson_idx").on(table.lessonId),
  ],
);

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey(),
    sessionHash: varchar("session_hash", { length: 64 }).notNull(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    answers: jsonb("answers").$type<number[]>().notNull(),
    score: integer("score").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("attempts_session_idx").on(table.sessionHash),
    index("attempts_quiz_idx").on(table.quizId),
  ],
);
