import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Kids Learning Portal home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
              <path
                d="M6 8.5c3.2-1.6 6.3-1.6 10 0v16c-3.7-1.6-6.8-1.6-10 0v-16Z"
                fill="#FFF8EC"
                stroke="#0A5A55"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M26 8.5c-3.2-1.6-6.3-1.6-10 0v16c3.7-1.6 6.8-1.6 10 0v-16Z"
                fill="#FCEBC2"
                stroke="#0A5A55"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M16 8.5v16" stroke="#0A5A55" strokeWidth="1.8" />
              <path
                d="m16 2.6 1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3L16 2.6Z"
                fill="#F4B740"
              />
            </svg>
          </span>
          <span className="brand-text">
            Kids Learning <span>Portal</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          <Link href="/">Lessons</Link>
          <Link href="/progress">My progress</Link>
        </nav>
      </div>
    </header>
  );
}
