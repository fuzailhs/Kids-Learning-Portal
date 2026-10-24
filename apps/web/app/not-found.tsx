import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container page">
      <div className="empty-state">
        <span className="empty-mark" aria-hidden="true">
          🧭
        </span>
        <h1>That page wandered off</h1>
        <p>
          We could not find the lesson or page you were looking for. It may have moved,
          or the link may be a little out of date.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to the lessons <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
