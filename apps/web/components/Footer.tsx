import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span aria-hidden="true">★</span> Kids Learning Portal
        </div>
        <p>
          A small sample project. No accounts, names, emails, or personal details
          are collected. Progress is anonymous and stays in this browser.
        </p>
        <Link href="/progress" className="footer-link">
          View or clear my progress
        </Link>
      </div>
    </footer>
  );
}
