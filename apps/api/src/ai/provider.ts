import { config } from "../config.js";
import { offlineQuizBank } from "../data/seed.js";
import { validateQuiz, type QuizQuestion } from "../lib/quiz.js";

export interface LessonForQuiz {
  id: string;
  title: string;
  version: number;
  readingMinutes: number;
  contentMd: string;
}

const SYSTEM_PROMPT = `You write one practice quiz for a children's learning app used by readers aged 8 to 12.

Rules:
- Use only information that is explicitly stated in the supplied lesson.
- Write exactly five multiple-choice questions.
- Every question must have exactly four distinct options and exactly one correct answer.
- Keep questions short, concrete, and age-appropriate. Do not ask for names, personal details, or free-text answers.
- Every question needs a one-sentence explanation grounded in the lesson.
- Return JSON only, with no markdown and no extra commentary, in this exact shape:
{"questions":[{"prompt":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."}]}`;

function buildUserPrompt(lesson: LessonForQuiz): string {
  return `Lesson title: ${lesson.title}
Reading time: ${lesson.readingMinutes} minutes
Lesson version: ${lesson.version}

Approved lesson:
"""
${lesson.contentMd}
"""

Write the five-question quiz for this lesson now.`;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("Provider response did not contain a JSON object.");
  }
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

async function requestOpenAI(lesson: LessonForQuiz): Promise<QuizQuestion[]> {
  if (!config.ai.apiKey) {
    throw new Error("AI_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`${config.ai.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.ai.model,
        temperature: 0.4,
        max_tokens: 1600,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(lesson) },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI provider returned HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error("AI provider returned an empty response.");
    }

    return validateQuiz(extractJson(content));
  } finally {
    clearTimeout(timer);
  }
}

function requestStub(lesson: LessonForQuiz): QuizQuestion[] {
  const bank = offlineQuizBank[lesson.id];
  if (!bank) {
    throw new Error("No offline quiz bank exists for this lesson.");
  }
  return validateQuiz({ questions: bank });
}

/**
 * Provider adapter. The AI provider is only ever called from the server, and
 * only approved lesson text is sent. One retry is allowed for provider,
 * parsing, or validation failure; after that the request fails closed.
 */
export async function generateQuiz(lesson: LessonForQuiz): Promise<QuizQuestion[]> {
  if (config.ai.provider === "stub") {
    return requestStub(lesson);
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await requestOpenAI(lesson);
    } catch (error) {
      lastError = error;
      console.warn(
        `quiz_provider_attempt_failed attempt=${attempt}`,
        error instanceof Error ? error.message : "unknown error",
      );
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI quiz generation failed.");
}
