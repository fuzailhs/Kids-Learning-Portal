export function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <svg viewBox="0 0 480 420" className="hero-svg" role="presentation">
        <defs>
          <linearGradient id="pageLeft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="100%" stopColor="#FFF3D7" />
          </linearGradient>
          <linearGradient id="pageRight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="100%" stopColor="#FBE9C2" />
          </linearGradient>
        </defs>

        <rect x="18" y="26" width="444" height="368" rx="52" fill="#DFF2EA" />

        <g className="float-slow">
          <circle cx="394" cy="84" r="40" fill="#F7C95C" />
          <g stroke="#F7C95C" strokeWidth="5" strokeLinecap="round">
            <path d="M394 24v-12" />
            <path d="M394 144v12" />
            <path d="M334 84h-12" />
            <path d="M454 84h12" />
            <path d="m351 41-9-9" />
            <path d="m437 127 9 9" />
            <path d="m437 41 9-9" />
            <path d="m351 127-9 9" />
          </g>
        </g>

        <g className="float-slower">
          <path
            d="M78 122c0-16 13-29 29-29 12 0 22 7 27 17 2-1 5-1 7-1 13 0 24 11 24 24s-11 24-24 24H104c-14 0-26-11-26-25v-10Z"
            fill="#C6E7F2"
          />
          <circle cx="116" cy="128" r="3.4" fill="#173B3A" />
          <circle cx="136" cy="128" r="3.4" fill="#173B3A" />
          <path
            d="M118 140c4 5 12 5 16 0"
            stroke="#173B3A"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="106" cy="138" r="4.5" fill="#F3A79B" opacity=".75" />
          <circle cx="146" cy="138" r="4.5" fill="#F3A79B" opacity=".75" />
        </g>

        <path
          d="m330 178 5.5 13.5 14 1.3-10.7 9.2 3.2 13.7-12-6.9-12 6.9 3.2-13.7-10.7-9.2 14-1.3L330 178Z"
          fill="#F4B740"
        />
        <path
          d="m92 246 3.8 9.2 9.6.9-7.3 6.3 2.2 9.4-8.3-4.8-8.3 4.8 2.2-9.4-7.3-6.3 9.6-.9L92 246Z"
          fill="#E9806E"
        />
        <circle cx="74" cy="74" r="9" fill="#F3A79B" />
        <circle cx="434" cy="206" r="7" fill="#0F766E" opacity=".55" />

        <g className="book-group">
          <ellipse cx="240" cy="368" rx="150" ry="18" fill="#0A5A55" opacity=".13" />
          <path
            d="M240 276c-38-22-88-24-140-6v86c52-18 102-16 140 6v-86Z"
            fill="url(#pageLeft)"
            stroke="#0A5A55"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M240 276c38-22 88-24 140-6v86c-52-18-102-16-140 6v-86Z"
            fill="url(#pageRight)"
            stroke="#0A5A55"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M240 276v86" stroke="#0A5A55" strokeWidth="4" strokeLinecap="round" />
          <g stroke="#B9CFC9" strokeWidth="3.5" strokeLinecap="round">
            <path d="M126 300c28-7 55-7 82 2" />
            <path d="M126 318c28-7 55-7 82 2" />
            <path d="M126 336c28-7 55-7 82 2" />
            <path d="M272 302c27-9 54-9 82-2" />
            <path d="M272 320c27-9 54-9 82-2" />
            <path d="M272 338c27-9 54-9 82-2" />
          </g>
          <path d="M100 356c52-18 102-16 140 6 38-22 88-24 140-6" fill="none" stroke="#0A5A55" strokeWidth="4" />
        </g>

        <g className="float-medium">
          <path
            d="m240 118 7.6 18.7 19.4 1.8-14.8 12.8 4.4 19-16.6-9.5-16.6 9.5 4.4-19-14.8-12.8 19.4-1.8L240 118Z"
            fill="#F7C95C"
            stroke="#0A5A55"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <circle cx="233" cy="154" r="3" fill="#173B3A" />
          <circle cx="247" cy="154" r="3" fill="#173B3A" />
          <path
            d="M234 163c3.5 4 8.5 4 12 0"
            stroke="#173B3A"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        <g className="float-fast">
          <rect x="348" y="272" width="18" height="82" rx="7" fill="#F2A48F" transform="rotate(24 348 272)" />
          <path d="m389 344 8 20-19-8 11-12Z" fill="#FBE3B9" transform="rotate(24 389 344)" />
          <rect x="348" y="272" width="18" height="13" rx="5" fill="#0F766E" transform="rotate(24 348 272)" />
        </g>
      </svg>

      <div className="hero-badge hero-badge-top">
        <span className="hero-badge-icon">🧪</span>
        <span>
          <strong>Science</strong>
          <small>3 mini-lessons</small>
        </span>
      </div>
      <div className="hero-badge hero-badge-bottom">
        <span className="hero-badge-icon">📖</span>
        <span>
          <strong>Reading</strong>
          <small>3 mini-lessons</small>
        </span>
      </div>
      <div className="hero-badge hero-badge-score">
        <span className="hero-badge-icon">⭐</span>
        <span>
          <strong>5 questions</strong>
          <small>after every lesson</small>
        </span>
      </div>
    </div>
  );
}
