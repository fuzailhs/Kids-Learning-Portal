"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { ApiRequestError, apiRequest } from "@/lib/api";
import type { AttemptResult, PublicQuiz } from "@/lib/types";

type Phase = "idle" | "loading" | "ready" | "results" | "error";

interface QuizPanelProps {
  lessonId: string;
  lessonTitle: string;
  subjectSlug: string;
  subjectTitle: string;
}

interface FriendlyError {
  message: string;
  requestId?: string;
}

const letterFor = (index: number): string => String.fromCharCode(65 + index);

function toFriendlyError(error: unknown, fallback: string): FriendlyError {
  if (error instanceof ApiRequestError) {
    return { message: error.message, requestId: error.requestId };
  }
  return { message: fallback };
}

function scoreMessage(score: number): string {
  if (score === 5) return "Perfect score! You really know this lesson.";
  if (score === 4) return "Great work — you are almost there.";
  if (score === 3) return "Nice thinking. Read the explanations to lock it in.";
  return "Good try. Read the explanations, then give it another go.";
}

export function QuizPanel({
  lessonId,
  lessonTitle,
  subjectSlug,
  subjectTitle,
}: QuizPanelProps) {
  const { refresh } = useProgress();
  const [phase, setPhase] = useState<Phase>("idle");
  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [answers, setAnswers] = useState<Array<number | null>>([null, null, null, null, null]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [startError, setStartError] = useState<FriendlyError | null>(null);
  const [submitError, setSubmitError] = useState<FriendlyError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const questionRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLHeadingElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const allAnswered = answeredCount === 5;

  useEffect(() => {
    if (phase === "ready") questionRef.current?.focus();
  }, [phase, current]);

  useEffect(() => {
    if (phase === "results") resultsRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase === "error") errorRef.current?.focus();
  }, [phase]);

  async function startQuiz(): Promise<void> {
    setPhase("loading");
    setStartError(null);
    setSubmitError(null);
    setResult(null);

    try {
      const data = await apiRequest<PublicQuiz>(`/api/lessons/${lessonId}/quiz`, {
        method: "POST",
        timeoutMs: 40_000,
      });
      setQuiz(data);
      setAnswers([null, null, null, null, null]);
      setCurrent(0);
      setPhase("ready");
    } catch (error) {
      setStartError(
        toFriendlyError(
          error,
          "We could not build a quiz right now. Please try again in a moment.",
        ),
      );
      setPhase("error");
    }
  }

  async function submitQuiz(): Promise<void> {
    if (!quiz || !allAnswered || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const data = await apiRequest<AttemptResult>(`/api/quizzes/${quiz.id}/attempts`, {
        method: "POST",
        body: { answers },
        timeoutMs: 20_000,
      });
      setResult(data);
      setPhase("results");
      await refresh();
    } catch (error) {
      setSubmitError(
        toFriendlyError(
          error,
          "We could not check your answers. Please try again in a moment.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const question = quiz?.questions[current];

  return (
    <section className="quiz-shell" aria-labelledby="quiz-title">
      <div className="quiz-heading">
        <div>
          <p className="eyebrow">Practice quiz</p>
          <h2 id="quiz-title">Five quick questions</h2>
        </div>
        <span className="quiz-badge">No timer · No sign-up</span>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {phase === "loading"
          ? "Building your quiz."
          : phase === "results" && result
            ? `Quiz complete. Score ${result.score} out of ${result.total}.`
            : ""}
      </p>

      {phase === "idle" ? (
        <div className="quiz-start">
          <div className="quiz-start-mark" aria-hidden="true">
            ✏️
          </div>
          <div className="quiz-start-copy">
            <h3>One question at a time, at your own pace</h3>
            <p>
              The quiz is made just for <strong>{lessonTitle}</strong>. You can go
              back, change an answer, and read an explanation after you finish.
            </p>
            <ul className="quiz-facts">
              <li>5 multiple-choice questions</li>
              <li>Instant explanations</li>
              <li>Private and anonymous</li>
            </ul>
          </div>
          <button type="button" className="btn btn-primary btn-lg" onClick={startQuiz}>
            Start quiz <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}

      {phase === "loading" ? (
        <div className="quiz-loading">
          <div className="quiz-loading-copy" role="status">
            <span className="spinner" aria-hidden="true" />
            <div>
              <strong>Building a quiz just for this lesson…</strong>
              <p>This can take a few seconds. Thanks for waiting.</p>
            </div>
          </div>
          <div className="skeleton-stack" aria-hidden="true">
            <span className="skeleton skeleton-title" />
            <span className="skeleton" />
            <span className="skeleton" />
            <span className="skeleton" />
            <span className="skeleton skeleton-short" />
          </div>
        </div>
      ) : null}

      {phase === "error" && startError ? (
        <div className="quiz-error" role="alert">
          <div className="quiz-error-mark" aria-hidden="true">
            ☁️
          </div>
          <div>
            <h3 ref={errorRef} tabIndex={-1}>
              We could not start the quiz
            </h3>
            <p>{startError.message}</p>
            {startError.requestId ? (
              <p className="reference">Reference: {startError.requestId}</p>
            ) : null}
          </div>
          <button type="button" className="btn btn-secondary" onClick={startQuiz}>
            Try again
          </button>
        </div>
      ) : null}

      {phase === "ready" && quiz && question ? (
        <div className="quiz-body">
          <div className="quiz-top">
            <div className="quiz-progress-wrap">
              <p className="quiz-kicker">
                Question {current + 1} of 5
              </p>
              <div
                className="quiz-progress"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={5}
                aria-valuenow={current + 1}
                aria-label="Quiz progress"
              >
                <span style={{ width: `${((current + 1) / 5) * 100}%` }} />
              </div>
            </div>
            <span className="quiz-count">{answeredCount}/5 answered</span>
          </div>

          <h3 id="quiz-question" ref={questionRef} tabIndex={-1} className="quiz-question">
            {question.prompt}
          </h3>

          <div className="option-list" role="radiogroup" aria-labelledby="quiz-question">
            {question.options.map((option, optionIndex) => {
              const selected = answers[current] === optionIndex;
              return (
                <label
                  key={`${question.prompt}-${optionIndex}`}
                  className={`option ${selected ? "option-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="quiz-answer"
                    className="sr-only"
                    checked={selected}
                    onChange={() =>
                      setAnswers((previous) =>
                        previous.map((value, index) =>
                          index === current ? optionIndex : value,
                        ),
                      )
                    }
                  />
                  <span className="option-key" aria-hidden="true">
                    {letterFor(optionIndex)}
                  </span>
                  <span className="option-text">{option}</span>
                </label>
              );
            })}
          </div>

          {submitError ? (
            <div className="quiz-inline-error" role="alert">
              <strong>We could not check your answers.</strong>
              <p>{submitError.message}</p>
              {submitError.requestId ? (
                <p className="reference">Reference: {submitError.requestId}</p>
              ) : null}
            </div>
          ) : null}

          <div className="quiz-nav">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setCurrent((value) => Math.max(0, value - 1))}
              disabled={current === 0 || submitting}
            >
              <span aria-hidden="true">←</span> Back
            </button>

            <p className="quiz-hint" aria-live="polite">
              {allAnswered
                ? "All five answered. Ready when you are!"
                : `${5 - answeredCount} ${5 - answeredCount === 1 ? "question" : "questions"} left to answer.`}
            </p>

            {current < 4 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrent((value) => Math.min(4, value + 1))}
                disabled={submitting}
              >
                Next <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitQuiz}
                disabled={!allAnswered || submitting}
              >
                {submitting ? "Checking…" : "Finish quiz"}
              </button>
            )}
          </div>
        </div>
      ) : null}

      {phase === "results" && result && quiz ? (
        <div className="results">
          <div className="score-hero">
            <div
              className="score-ring"
              style={{ "--score": `${(result.score / result.total) * 100}%` } as CSSProperties}
              aria-label={`Score ${result.score} out of ${result.total}`}
              role="img"
            >
              <div className="score-ring-inner">
                <strong>{result.score}</strong>
                <span>of {result.total}</span>
              </div>
            </div>
            <div className="score-copy">
              <p className="eyebrow">Quiz complete</p>
              <h3 ref={resultsRef} tabIndex={-1}>
                {scoreMessage(result.score)}
              </h3>
              <p>
                {result.score === 5
                  ? "You answered every question correctly."
                  : "Every answer comes with a short explanation, so you can see exactly why."}
              </p>
            </div>
          </div>

          <ol className="result-list">
            {result.results.map((item) => {
              const answeredQuestion = quiz.questions[item.questionIndex];
              const selectedText =
                answeredQuestion?.options[item.selectedIndex] ?? "No answer";
              const correctText =
                answeredQuestion?.options[item.correctIndex] ?? "See explanation";

              return (
                <li
                  key={item.questionIndex}
                  className={`result-item ${item.isCorrect ? "correct" : "incorrect"}`}
                >
                  <div className="result-head">
                    <span className="result-icon" aria-hidden="true">
                      {item.isCorrect ? "✓" : "×"}
                    </span>
                    <p className="result-question">
                      <span>Question {item.questionIndex + 1}</span>
                      {answeredQuestion?.prompt}
                    </p>
                    <span className="result-mark">
                      {item.isCorrect ? "Correct" : "Not quite"}
                    </span>
                  </div>

                  <p className="answer-line">
                    <span>Your answer:</span> {selectedText}
                  </p>
                  {!item.isCorrect ? (
                    <p className="answer-line answer-correct">
                      <span>Correct answer:</span> {correctText}
                    </p>
                  ) : null}
                  <p className="explanation">{item.explanation}</p>
                </li>
              );
            })}
          </ol>

          <div className="results-actions">
            <button type="button" className="btn btn-primary" onClick={startQuiz}>
              Practice again
            </button>
            <Link href={`/subjects/${subjectSlug}`} className="btn btn-secondary">
              Back to {subjectTitle}
            </Link>
            <Link href="/progress" className="btn btn-ghost">
              See my progress
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
