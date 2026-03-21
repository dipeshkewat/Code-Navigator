import { useState } from 'react';
import { parseGitHubUrl } from '../utils/github';

interface Props {
  onAnalyze: (url: string) => void;
  loading: boolean;
}

const examples = [
  { label: 'facebook/react', url: 'https://github.com/facebook/react' },
  { label: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
  { label: 'tiangolo/fastapi', url: 'https://github.com/tiangolo/fastapi' },
];

export default function UrlInput({ onAnalyze, loading }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = url.trim();
    if (!trimmed) { setError('Please enter a GitHub repository URL.'); return; }
    const parsed = parseGitHubUrl(trimmed);
    if (!parsed) { setError('Invalid URL. Example: https://github.com/owner/repo'); return; }
    onAnalyze(trimmed);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* ── Input row ── */}
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 p-2 rounded-2xl transition-all duration-200"
          style={{
            background: '#141414',
            border: `1px solid ${error ? '#ef4444' : focused ? 'rgba(245,166,35,0.4)' : '#2a2a2a'}`,
            boxShadow: focused ? '0 0 0 3px rgba(245,166,35,0.06)' : 'none',
          }}
        >
          {/* GitHub icon + input */}
          <div className="flex items-center gap-2 flex-1 px-2 sm:px-3 min-w-0">
            <svg
              className="w-4 h-4 flex-shrink-0"
              style={{ color: '#52525b' }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <input
              type="text"
              value={url}
              onChange={e => { setUrl(e.target.value); setError(''); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="https://github.com/owner/repository"
              disabled={loading}
              className="flex-1 bg-transparent outline-none disabled:opacity-50 min-w-0 py-2 sm:py-0"
              style={{
                color: '#ffffff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78rem',
                caretColor: '#F5A623',
              }}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto flex-shrink-0"
            style={{
              background: loading || !url.trim()
                ? '#2a2a2a'
                : 'linear-gradient(135deg, #F5A623 0%, #e8940f 100%)',
              color: loading || !url.trim() ? '#52525b' : '#000000',
            }}
          >
            {loading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Analyze Repository</span>
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="flex items-center gap-1.5 text-xs px-1" style={{ color: '#f87171' }}>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
      </form>

      {/* Examples */}
      <div className="mt-5 flex flex-col items-center gap-3">
        <span className="text-xs" style={{ color: '#3f3f46' }}>Try an example:</span>
        <div className="flex flex-wrap gap-2 justify-center">
          {examples.map(ex => (
            <button
              key={ex.url}
              onClick={() => { setUrl(ex.url); setError(''); }}
              disabled={loading}
              className="px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 disabled:opacity-40"
              style={{ background: '#141414', border: '1px solid #2a2a2a', color: '#71717a' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,166,35,0.3)';
                (e.currentTarget as HTMLButtonElement).style.color = '#F5A623';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a';
                (e.currentTarget as HTMLButtonElement).style.color = '#71717a';
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
