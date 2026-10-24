"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/components/ProgressProvider";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function scoreTone(score: number): string {
  if (score === 5) return "score-pill score-pill--perfect";
  if (score >= 3) return "score-pill score-pill--good";
  return "score-pill score-pill--try";
}

export default function ProgressPage() {
  const { progress, loading, failed, refresh, clear } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function handleClear(): Promise<void> {
    setClearing(true);
    setError("");
    try {
      await clear();
      setConfirming(false);
      setNotice("Your progress has been cleared from this browser.");
    } catch {
      setError("We could not clear your progress just now. Please try again.");
    } finally {
      setClearing(false);
    }
  }

  const perfect =
    progress?.completedLessons.filter((lesson) => lesson.bestScore === 5).length ?? 0;

  return (
    <div className="container page progress-page">
      <header className="page-head page-head--stacked">
        <div>
          <p className="eyebrow">Just for you</p>
          <h1>My progress</h1>
          <p className="page-lead">
            Everything here is anonymous and lives only in this browser. Clear it any
            time — nothing is sent to a parent, teacher, or advertiser.
          </p>
        </div>
      </header>

      {notice ? (
        <p className="notice notice-success" role="status">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading && !progress ? (
        <div className="progress-loading" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Loading your progress…</span>
        </div>
      ) : null}

      {!loading && failed && !progress ? (
        <div className="notice notice-error" role="alert">
          <div>
            <strong>We could not load your progress.</strong>
            <p>The learning server may be taking a short break.</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => void refresh()}>
            Try again
          </button>
        </div>
      ) : null}

      {progress && progress.totalAttempts === 0 ? (
        <section className="empty-state" aria-labelledby="empty-title">
          <span className="empty-mark" aria-hidden="true">
            🌱
          </span>
          <h2 id="empty-title">Your learning garden is empty</h2>
          <p>
            Finish a practice quiz and your scores will appear here. There is no account
            to create — just pick a lesson and begin.
          </p>
          <Link href="/" className="btn btn-primary">
            Find a lesson <span aria-hidden="true">→</span>
          </Link>
        </section>
      ) : null}

      {progress && progress.totalAttempts > 0 ? (
        <>
          <section className="stats-grid" aria-label="Progress summary">
            <div className="stat-card">
              <span className="stat-value">{progress.totalAttempts}</span>
              <span className="stat-label">
                {progress.totalAttempts === 1 ? "quiz finished" : "quizzes finished"}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{progress.completedLessons.length}</span>
              <span className="stat-label">
                {progress.completedLessons.length === 1 ? "lesson practiced" : "lessons practiced"}
              </span>
            </div>
            <div className="stat-card stat-card--sun">
              <span className="stat-value">{perfect}</span>
              <span className="stat-label">
                {perfect === 1 ? "perfect score" : "perfect scores"}
              </span>
            </div>
          </section>

          <section className="progress-section" aria-labelledby="lessons-title">
            <div className="section-head section-head--small">
              <h2 id="lessons-title">Lessons practiced</h2>
              <p className="section-note">Your best score for each lesson.</p>
            </div>
            <ul className="progress-list">
              {progress.completedLessons.map((lesson) => (
                <li key={lesson.lessonId} className="progress-row">
                  <div className="progress-row-main">
                    <p className="progress-lesson">{lesson.lessonTitle}</p>
                    <p className="progress-sub">
                      {lesson.subjectTitle}
                      <span className="dot" aria-hidden="true">·</span>
                      {lesson.attempts} {lesson.attempts === 1 ? "attempt" : "attempts"}
                    </p>
                  </div>
                  <span className={scoreTone(lesson.bestScore)}>
                    {lesson.bestScore}/5
                  </span>
                  <Link
                    href={`/lessons/${lesson.lessonId}`}
                    className="btn btn-ghost btn-small"
                  >
                    Practice again
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="progress-section" aria-labelledby="recent-title">
            <div className="section-head section-head--small">
              <h2 id="recent-title">Recent attempts</h2>
              <p className="section-note">Newest first.</p>
            </div>
            <ul className="attempt-list">
              {progress.attempts.slice(0, 12).map((attempt) => (
                <li key={attempt.id} className="attempt-row">
                  <span className={scoreTone(attempt.score)}>{attempt.score}/5</span>
                  <span className="attempt-lesson">{attempt.lessonTitle}</span>
                  <span className="attempt-date">{formatDate(attempt.submittedAt)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="clear-zone" aria-labelledby="clear-title">
            <div>
              <h2 id="clear-title">Clear my progress</h2>
              <p>
                This permanently removes every quiz attempt from this browser. Your
                lessons stay available.
              </p>
            </div>

            {!confirming ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setConfirming(true);
                  setNotice("");
                }}
              >
                Clear my progress
              </button>
            ) : (
              <div className="clear-confirm" role="group" aria-label="Confirm clearing progress">
                <p>Are you sure? This cannot be undone.</p>
                <div className="clear-actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleClear}
                    disabled={clearing}
                  >
                    {clearing ? "Clearing…" : "Yes, clear it"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setConfirming(false)}
                    disabled={clearing}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
