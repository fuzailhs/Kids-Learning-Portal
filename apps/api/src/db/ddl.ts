/**
 * Database DDL for the four MVP tables.
 *
 * The local development database is PGlite, a real PostgreSQL build compiled to
 * WebAssembly. Production uses the same SQL against a hosted PostgreSQL via
 * DATABASE_URL, so behaviour stays consistent.
 */
export const DDL = `
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY,
  slug varchar(40) NOT NULL UNIQUE,
  title varchar(80) NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title varchar(120) NOT NULL,
  content_md text NOT NULL,
  reading_minutes integer NOT NULL CHECK (reading_minutes BETWEEN 1 AND 30),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lessons_subject_idx ON lessons (subject_id);

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  lesson_version integer NOT NULL,
  questions jsonb NOT NULL,
  status varchar(16) NOT NULL CHECK (status IN ('validated', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS quizzes_valid_lesson_version_idx
  ON quizzes (lesson_id, lesson_version)
  WHERE status = 'validated';
CREATE INDEX IF NOT EXISTS quizzes_lesson_idx ON quizzes (lesson_id);

CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY,
  session_hash varchar(64) NOT NULL,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  answers jsonb NOT NULL,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 5),
  submitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS attempts_session_idx ON attempts (session_hash);
CREATE INDEX IF NOT EXISTS attempts_quiz_idx ON attempts (quiz_id);
`;
