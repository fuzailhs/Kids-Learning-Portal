# Kids Learning Portal

A small, child-safe learning app built as **Sample Project 06** for the AI Vibe
Coding Course. It presents curated mini-lessons, generates a five-question
practice quiz grounded in the selected lesson, and tracks anonymous progress.

- **Ages 8–12**
- **No accounts, no names, no emails, no free-text input, no ads**
- **One lesson → one quiz → one clear result**
- **Next.js + TypeScript web client**
- **Node.js + Express + TypeScript API**
- **PostgreSQL data model** (embedded PGlite locally, hosted Postgres in production)
- **Server-only AI provider adapter** with strict JSON validation and one retry

---

## Quick start

Requirements: **Node.js 20.11+** (tested on Node 24) and npm.

```bash
npm install
npm run dev
```

`npm run dev` automatically creates the local embedded PostgreSQL database,
applies the schema, seeds the six curated lessons, then starts:

- Web app: <http://localhost:3000>
- API: <http://localhost:4000>
- Health check: <http://localhost:4000/api/health>

No API key, database server, or account is needed for the local demo. Quizzes
come from the offline sample bank until you configure a live AI provider.

### Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Set up the database and run web + API together |
| `npm run build` | Type-check/build the API and production Next.js bundle |
| `npm start` | Run both production builds locally |
| `npm test` | Run API unit tests (validation, scoring, no-answer leakage) |
| `npm run typecheck` | Type-check both workspaces |
| `npm run db:setup` | Apply the schema and idempotently seed lessons |
| `npm run db:seed` | Re-run the seed only |

---

## How the learning loop works

1. **Home** lists active subjects and a short privacy note.
2. **Subject** lists lesson summaries. No personal data is required.
3. **Lesson** shows title, reading time, approved content, and a Start quiz button.
4. **Quiz** asks five questions one at a time, allows Back/Next without losing a
   selection, and blocks finishing until all five are answered.
5. **Results** show the server-calculated score, the correct answer, and a short
   explanation for every question.
6. **Progress** shows anonymous attempts in this browser and can clear them.

### Privacy and safety boundary

- The browser creates a random anonymous session id and stores it in
  `localStorage`.
- The API stores only `HMAC-SHA256(SESSION_HASH_SALT, session id)`. It does not
  store the raw id, IP address, user-agent, name, email, birthday, or location.
- No free-text fields, uploads, chat, payments, messaging, social features, or
  public profiles exist.
- Correct answers and explanations are stripped from the quiz response and only
  returned after an attempt is submitted (FR-009).
- Request bodies are never logged. Errors return a generic message plus a request
  id, never provider output or stack traces.

---

## Architecture

```
Browser
  Next.js web client (React server components + small client islands)
        │  GET subjects/lessons (server-side fetch)
        │  POST quiz / attempts, GET+DELETE progress (browser, X-Session-Id)
        ▼
  Express API (TypeScript)
        │  Zod validation, scoring, caching, rate limits, privacy boundary
        ├──────────────► PostgreSQL (PGlite locally / hosted Postgres)
        └──────────────► AI provider adapter (server only, 15s timeout, 1 retry)
```

### Project layout

```
apps/
  api/
    src/
      ai/provider.ts        Provider adapter + Stub + OpenAI-compatible client
      data/seed.ts          Six curated lessons + offline quiz bank
      db/                   Drizzle schema, DDL, PGlite/Postgres connection
      lib/quiz.ts           Zod validation, scoring, public-quiz mapping
      lib/session.ts        Anonymous session HMAC middleware
      routes/               Catalog, quiz, progress, facilitator CSV
      scripts/              Repeatable migrate/seed scripts
  web/
    app/                    Home, subject, lesson, progress, not-found
    components/             Quiz runner, markdown, hero art, progress context
    lib/                    API client, anonymous session, shared types
docs/
  PRD.md
  FUNCTIONAL_REQUIREMENTS.md
  TECHNICAL_REQUIREMENTS.md
```

### Data model

| Entity | Key columns |
| --- | --- |
| `subjects` | `id`, `slug` (unique), `title` (≤80), `is_active` |
| `lessons` | `id`, `subject_id`, `title` (≤120), `content_md`, `reading_minutes` 1–30, `version`, `is_active`, timestamps |
| `quizzes` | `id`, `lesson_id`, `lesson_version`, `questions` JSONB, `status` validated/rejected, `created_at`; partial unique index on validated quiz per lesson version |
| `attempts` | `id`, `session_hash`, `quiz_id`, `answers` JSONB, `score` 0–5, `submitted_at`; immutable |

The DDL lives in `apps/api/src/db/ddl.ts`; the typed schema lives in
`apps/api/src/db/schema.ts`. Drizzle ORM is used for parameterised queries. The
schema mirrors the required Prisma-style model one-to-one.

---

## API

All responses are JSON. Mutating learner endpoints require `X-Session-Id`.

| Method and path | Behaviour |
| --- | --- |
| `GET /api/subjects` | Active subjects with lesson counts |
| `GET /api/subjects/:slug/lessons` | Active lesson summaries for one subject |
| `GET /api/lessons/:id` | Approved lesson content |
| `POST /api/lessons/:id/quiz` | Return the cached validated quiz or generate one |
| `POST /api/quizzes/:id/attempts` | Validate five answers, score on the server, store, return results |
| `GET /api/progress` | Anonymous attempts and best score per lesson for this session |
| `DELETE /api/progress` | Delete this session's attempts |
| `GET /api/health` | Liveness check |
| `GET /api/facilitator/export` | Protected CSV export (lesson, score, timestamp only) |

### Quiz generation and caching

- The system prompt and lesson text are the only inputs. No child input is sent.
- Output must be exactly five questions, four distinct options each, one correct
  index, and a non-empty explanation. Zod validation is strict and rejects
  unknown fields.
- A 15-second timeout and **one retry** handle provider failure. Validation
  failures also fail closed after one retry.
- A valid quiz is cached by `(lesson_id, lesson_version)` in `quizzes`. Concurrent
  requests race safely on a partial unique index.
- If generation fails, the child sees a friendly retry message with a request id.
  Partial or malformed provider output is never shown.

### Rate limits

- New quiz generations: 10 per anonymous session per 10 minutes.
- Cached quiz reads do not consume the generation limit.
- Attempt submission requires exactly five integer answers from 0 to 3.

### Facilitator export

Set `FACILITATOR_TOKEN` on the API, then:

```bash
curl -H "Authorization: Bearer $FACILITATOR_TOKEN" \
  http://localhost:4000/api/facilitator/export \
  --output attempts.csv
```

The CSV contains only `lesson,score,submitted_at` — no session hash, name, or
personal data.

---

## Environment variables

Copy the examples if you want to change defaults:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### API (`apps/api/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No (4000) | API port |
| `NODE_ENV` | No | `production` enables strict secret checks |
| `CLIENT_ORIGIN` | Yes in prod | Comma-separated browser origins allowed by CORS |
| `SESSION_HASH_SALT` | **Yes in prod** | Secret salt for anonymous session hashes |
| `DATABASE_URL` | Prod | `postgresql://…`; omit to use embedded PGlite |
| `PGSSL` | No | `true` if hosted Postgres requires TLS |
| `PGLITE_DATA_DIR` | No | Local database directory (default `.data/pglite`) |
| `AI_PROVIDER` | No | `stub` (offline) or `openai` |
| `AI_API_KEY` | With `openai` | Server-only provider key |
| `AI_BASE_URL` | No | OpenAI-compatible base URL |
| `AI_MODEL` | No | Model name (default `gpt-4o-mini`) |
| `FACILITATOR_TOKEN` | No | Enables the protected CSV export |

### Web (`apps/web/.env.local`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | API URL used by the browser |
| `API_INTERNAL_URL` | API URL used by Next.js server components |

### Using a live model

```bash
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

Any OpenAI-compatible endpoint works via `AI_BASE_URL`. The key never reaches the
browser. In production the API refuses to start with `AI_PROVIDER=openai` and no
key.

---

## Deployment to Railway

The project is ready for three Railway services plus a PostgreSQL plugin.

1. Push the repository to GitHub (default branch `main`).
2. In Railway, create a **PostgreSQL** service. Copy its connection string.
3. Create an **API** service from the repo:
   - Root directory: `apps/api`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Variables: `DATABASE_URL` (from Postgres), `SESSION_HASH_SALT`,
     `CLIENT_ORIGIN` (the web service URL), `NODE_ENV=production`,
     `AI_PROVIDER=openai`, `AI_API_KEY`, `AI_MODEL`, and optionally
     `FACILITATOR_TOKEN`.
   - Run `npm run db:setup` once as a deploy/release command to create tables and
     seed the six lessons. The API also applies the idempotent DDL on boot.
4. Create a **Web** service:
   - Root directory: `apps/web`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Variables: `NEXT_PUBLIC_API_URL` (public API URL), `API_INTERNAL_URL`
     (Railway-private API URL if available).
5. Set the API's `CLIENT_ORIGIN` to the final web URL and redeploy if needed.
6. Smoke test: health check, subject list, one full lesson-to-results flow,
   progress persistence, clear progress, and an invalid-session request.

Never commit `.env` files or secrets. The `.gitignore` already excludes them.

---

## Definition of done

- [x] A learner can complete the full lesson-to-results flow.
- [x] Every generated quiz is grounded in one approved lesson and validated.
- [x] No names, email, child location, or free-text child input is requested.
- [x] Invalid AI output fails closed without breaking the app.
- [x] README explains setup, environment variables, seed data, and deployment.
- [x] Unit tests cover quiz validation, server-side scoring, and answer leakage.
- [x] Anonymous progress can be viewed and cleared.
- [x] Keyboard flow, labelled controls, live status, visible focus, 44px+ targets.
- [x] Protected facilitator CSV export contains no personal data.

Accessibility target: WCAG 2.2 AA for the implemented flows, semantic headings,
labelled radio groups, focus management after quiz step changes, `aria-live`
loading/results announcements, and reduced-motion support.
