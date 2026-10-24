import Link from "next/link";
import { HeroArt } from "@/components/HeroArt";
import { HomeProgress } from "@/components/HomeProgress";
import { ServiceUnavailable } from "@/components/ServiceUnavailable";
import { fetchServer } from "@/lib/api";
import type { SubjectSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

const subjectDetails: Record<
  string,
  { emoji: string; blurb: string; accent: "science" | "reading" }
> = {
  science: {
    emoji: "🧪",
    blurb: "Water, plants, and the Moon — curious questions about the world around us.",
    accent: "science",
  },
  reading: {
    emoji: "📖",
    blurb: "Main ideas, story settings, and word clues — smarter reading, step by step.",
    accent: "reading",
  },
};

export default async function HomePage() {
  let subjects: SubjectSummary[] | null = null;
  try {
    const data = await fetchServer<{ subjects: SubjectSummary[] }>("/api/subjects");
    subjects = data.subjects;
  } catch {
    subjects = null;
  }

  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">A safe little learning corner</p>
          <h1>
            Big ideas,
            <br />
            one small step
            <br />
            at a time.
          </h1>
          <p className="hero-lead">
            Pick a subject, read a short mini-lesson, and finish with a five-question
            quiz made just for it. No accounts, no personal details — just learning.
          </p>

          <div className="chip-row">
            <span className="chip">
              <span aria-hidden="true">🎈</span> Ages 8–12
            </span>
            <span className="chip">
              <span aria-hidden="true">⏱️</span> 2–3 minute lessons
            </span>
            <span className="chip">
              <span aria-hidden="true">🔒</span> Private by design
            </span>
          </div>

          <div className="hero-actions">
            <a href="#subjects" className="btn btn-primary btn-lg">
              Choose a subject <span aria-hidden="true">→</span>
            </a>
            <Link href="/progress" className="btn btn-secondary btn-lg">
              My progress
            </Link>
          </div>
        </div>

        <HeroArt />
      </section>

      <div className="container">
        <HomeProgress />
      </div>

      <section id="subjects" className="section container" aria-labelledby="subjects-title">
        <div className="section-head">
          <div>
            <p className="eyebrow">Start here</p>
            <h2 id="subjects-title">Pick a subject</h2>
          </div>
          <p className="section-note">
            Six hand-picked lessons. Every one ends with a fresh quiz and a clear
            explanation for each answer.
          </p>
        </div>

        {subjects === null ? (
          <ServiceUnavailable />
        ) : (
          <div className="subject-grid">
            {subjects.map((subject) => {
              const detail = subjectDetails[subject.slug] ?? {
                emoji: "✨",
                blurb: "A short, friendly lesson with a five-question quiz.",
                accent: "science" as const,
              };
              return (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.slug}`}
                  className={`subject-card subject-card--${detail.accent}`}
                >
                  <span className="subject-emoji" aria-hidden="true">
                    {detail.emoji}
                  </span>
                  <h3>{subject.title}</h3>
                  <p>{detail.blurb}</p>
                  <span className="subject-meta">
                    {subject.lessonCount} {subject.lessonCount === 1 ? "lesson" : "lessons"}
                    <span className="subject-arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="section container how-section" aria-labelledby="how-title">
        <div className="section-head">
          <div>
            <p className="eyebrow">Simple by design</p>
            <h2 id="how-title">How it works</h2>
          </div>
        </div>

        <ol className="steps">
          <li className="step">
            <span className="step-number" aria-hidden="true">
              1
            </span>
            <h3>Read a mini-lesson</h3>
            <p>Clear, friendly writing that takes two or three minutes — no rush.</p>
          </li>
          <li className="step">
            <span className="step-number" aria-hidden="true">
              2
            </span>
            <h3>Answer five questions</h3>
            <p>One question at a time. Go back and change any answer before you finish.</p>
          </li>
          <li className="step">
            <span className="step-number" aria-hidden="true">
              3
            </span>
            <h3>See what you learned</h3>
            <p>Get your score and a short explanation for every single question.</p>
          </li>
        </ol>
      </section>

      <section className="container section" aria-labelledby="privacy-title">
        <div className="privacy-card">
          <div className="privacy-mark" aria-hidden="true">
            🔒
          </div>
          <div className="privacy-copy">
            <p className="eyebrow">Built for kids, private by design</p>
            <h2 id="privacy-title">No names. No email. No tracking.</h2>
            <p>
              We never ask who you are. Progress lives in this browser through a
              random anonymous session, and you can clear it at any time.
            </p>
            <Link href="/progress" className="text-link">
              View or clear my progress <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="privacy-list">
            <li>No accounts or sign-ups</li>
            <li>No names, emails, or birthdays</li>
            <li>No free-text chat or uploads</li>
            <li>No ads or social features</li>
          </ul>
        </div>
      </section>
    </>
  );
}
