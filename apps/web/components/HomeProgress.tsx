"use client";

import Link from "next/link";
import { useProgress } from "@/components/ProgressProvider";

export function HomeProgress() {
  const { progress } = useProgress();

  if (!progress || progress.totalAttempts === 0) return null;

  const perfect = progress.completedLessons.filter((lesson) => lesson.bestScore === 5).length;

  return (
    <aside className="home-progress" aria-label="Your learning progress">
      <div className="home-progress-icon" aria-hidden="true">
        ⭐
      </div>
      <div>
        <p className="home-progress-title">Welcome back, learner!</p>
        <p className="home-progress-text">
          {progress.totalAttempts} {progress.totalAttempts === 1 ? "quiz" : "quizzes"} finished
          {perfect > 0 ? `, ${perfect} with a perfect score` : ""}. Keep going at your own pace.
        </p>
      </div>
      <Link href="/progress" className="btn btn-secondary">
        See my progress
      </Link>
    </aside>
  );
}
