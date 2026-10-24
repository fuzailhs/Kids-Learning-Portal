import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonStatus } from "@/components/LessonStatus";
import { ServiceUnavailable } from "@/components/ServiceUnavailable";
import { ApiRequestError, fetchServer } from "@/lib/api";
import type { SubjectLessonsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const subjectDetails: Record<
  string,
  { emoji: string; blurb: string; accent: "science" | "reading" }
> = {
  science: {
    emoji: "🧪",
    blurb:
      "Three short lessons about the world around us. Read, practice, and see what sticks.",
    accent: "science",
  },
  reading: {
    emoji: "📖",
    blurb:
      "Three short lessons to make reading feel easier. Read, practice, and see what sticks.",
    accent: "reading",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label =
    slug === "science"
      ? "Science Explorers"
      : slug === "reading"
        ? "Reading Detectives"
        : "Lessons";
  return { title: label };
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data: SubjectLessonsResponse;
  try {
    data = await fetchServer<SubjectLessonsResponse>(
      `/api/subjects/${encodeURIComponent(slug)}/lessons`,
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    return (
      <div className="container page">
        <ServiceUnavailable />
      </div>
    );
  }

  const detail = subjectDetails[data.subject.slug] ?? {
    emoji: "✨",
    blurb: "A short, friendly lesson with a five-question quiz.",
    accent: "science" as const,
  };

  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{data.subject.title}</span>
      </nav>

      <header className="page-head">
        <span
          className={`subject-emoji subject-emoji--large subject-emoji--${detail.accent}`}
          aria-hidden="true"
        >
          {detail.emoji}
        </span>
        <div>
          <p className="eyebrow">Subject</p>
          <h1>{data.subject.title}</h1>
          <p className="page-lead">{detail.blurb}</p>
        </div>
      </header>

      <section className="subject-lessons" aria-labelledby="lesson-list-title">
        <div className="section-head section-head--small">
          <h2 id="lesson-list-title">
            {data.lessons.length} {data.lessons.length === 1 ? "lesson" : "lessons"}
          </h2>
          <p className="section-note">Pick any lesson. They can be done in any order.</p>
        </div>

        {data.lessons.length === 0 ? (
          <div className="empty-state">
            <p>No lessons are available just yet. Please check back soon.</p>
          </div>
        ) : (
          <ol className="lesson-list">
            {data.lessons.map((lesson, index) => (
              <li key={lesson.id}>
                <Link href={`/lessons/${lesson.id}`} className="lesson-card">
                  <span className="lesson-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="lesson-card-body">
                    <span className="lesson-title">{lesson.title}</span>
                    <span className="lesson-meta">
                      <span aria-hidden="true">⏱️</span> {lesson.readingMinutes} minute
                      read <span className="dot" aria-hidden="true">·</span> 5-question
                      quiz
                    </span>
                  </span>
                  <LessonStatus lessonId={lesson.id} />
                  <span className="lesson-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <aside className="subject-tip">
        <span aria-hidden="true">💡</span>
        <p>
          <strong>Tip for grown-ups:</strong> there is nothing to set up and nothing to
          sign into. Progress stays anonymous in this browser.
        </p>
      </aside>
    </div>
  );
}
