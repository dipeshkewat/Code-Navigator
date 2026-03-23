export default function Header() {
  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid #1a1a1a',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">

        {/* Logo mark + wordmark */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex-shrink-0"
            style={{ background: '#0f0f0f', border: '1px solid #222' }}
          >
            {/* Inline { } logo — white left brace, amber right brace */}
            <svg viewBox="0 0 36 42" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left brace */}
              <path
                d="M15 5 C11 5 9 7 9 11 L9 16 C9 19 7 20.5 5 21.5 C7 22.5 9 24 9 27 L9 32 C9 36 11 38 15 38"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Right brace */}
              <path
                d="M21 5 C25 5 27 7 27 11 L27 16 C27 19 29 20.5 31 21.5 C29 22.5 27 24 27 27 L27 32 C27 36 25 38 21 38"
                stroke="#F5A623"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-sm tracking-tight">Code Navigator</span>
            <span
              className="text-xs mt-0.5"
              style={{ color: '#F5A623', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
            >
              AI Repo Explainer
            </span>
          </div>
        </div>

        {/* Right side pills */}
        <div className="flex items-center gap-2">
          {/* Live dot */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: '#111', border: '1px solid #1e1e1e', color: '#52525b' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
              style={{ background: '#4ade80' }}
            />
            <span className="hidden sm:inline">AI Ready</span>
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com/dipeshkewat"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
            style={{ background: '#111', border: '1px solid #1e1e1e', color: '#52525b' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,166,35,0.3)';
              (e.currentTarget as HTMLAnchorElement).style.color = '#F5A623';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1e1e1e';
              (e.currentTarget as HTMLAnchorElement).style.color = '#52525b';
            }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
