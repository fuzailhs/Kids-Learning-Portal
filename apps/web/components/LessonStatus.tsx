"use client";

import { useProgress } from "@/components/ProgressProvider";

export function LessonStatus({ lessonId }: { lessonId: string }) {
  const { progress } = useProgress();
  const entry = progress?.completedLessons.find((lesson) => lesson.lessonId === lessonId);

  if (!entry) {
    return <span className="status status-new">New</span>;
  }

  if (entry.bestScore === 5) {
    return (
      <span className="status status-done">
        <span aria-hidden="true">✓</span> Completed · 5/5
      </span>
    );
  }

  return (
    <span className="status status-try">
      Best {entry.bestScore}/5 · try again
    </span>
  );
}
