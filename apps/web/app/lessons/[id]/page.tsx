import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { QuizPanel } from "@/components/QuizPanel";
import { ServiceUnavailable } from "@/components/ServiceUnavailable";
import { ApiRequestError, fetchServer } from "@/lib/api";
import type { LessonDetail } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const lesson = await fetchServer<LessonDetail>(`/api/lessons/${encodeURIComponent(id)}`);
    return { title: lesson.title };
  } catch {
    return { title: "Lesson" };
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let lesson: LessonDetail;
  try {
    lesson = await fetchServer<LessonDetail>(`/api/lessons/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    return (
      <div className="container page">
        <ServiceUnavailable />
      </div>
    );
  }

  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/subjects/${lesson.subjectSlug}`}>{lesson.subjectTitle}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{lesson.title}</span>
      </nav>

      <div className="lesson-layout">
        <article className="lesson-article">
          <header className="lesson-header">
            <p className="eyebrow">{lesson.subjectTitle}</p>
            <h1>{lesson.title}</h1>
            <p className="reading-meta">
              <span aria-hidden="true">⏱️</span>
              {lesson.readingMinutes} minute read
              <span className="dot" aria-hidden="true">·</span>
              5-question quiz
            </p>
          </header>

          <Markdown text={lesson.contentMd} />

          <QuizPanel
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            subjectSlug={lesson.subjectSlug}
            subjectTitle={lesson.subjectTitle}
          />
        </article>

        <aside className="lesson-aside" aria-label="Lesson information">
          <div className="aside-card">
            <h2>In this practice</h2>
            <ul className="aside-list">
              <li>
                <span aria-hidden="true">📝</span> 5 multiple-choice questions
              </li>
              <li>
                <span aria-hidden="true">🔁</span> Change answers before finishing
              </li>
              <li>
                <span aria-hidden="true">💬</span> An explanation for every answer
              </li>
              <li>
                <span aria-hidden="true">🏁</span> No timer, no pressure
              </li>
            </ul>
          </div>

          <div className="aside-card aside-card--soft">
            <span className="aside-mark" aria-hidden="true">
              🔒
            </span>
            <h2>Private by design</h2>
            <p>
              No name, email, birthday, or location is ever requested. Your progress
              is anonymous and stored only in this browser.
            </p>
          </div>

          <Link href={`/subjects/${lesson.subjectSlug}`} className="aside-back">
            <span aria-hidden="true">←</span> All {lesson.subjectTitle} lessons
          </Link>
        </aside>
      </div>
    </div>
  );
}
