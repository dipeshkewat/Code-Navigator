import { useState, useCallback } from 'react';
import type { RepoAnalysis, AnalysisStatus } from './types';
import Header from './components/Header';
import UrlInput from './components/UrlInput';
import LoadingState from './components/LoadingState';
import ResultPanel from './components/ResultPanel';
import { parseGitHubUrl, fetchRepoInfo, fetchRepoTree, fetchReadme, gatherRepoContext } from './utils/github';
import { analyzeRepository } from './utils/ai';
import { getCachedAnalysis, setCachedAnalysis } from './utils/cache';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    label: 'Project Summary',
    desc: 'Purpose, mechanics, tech stack in plain English',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    label: 'Folder Structure',
    desc: 'Full tree with importance indicators',
    color: '#F5A623',
    bg: 'rgba(245,166,35,0.08)',
    border: 'rgba(245,166,35,0.2)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    label: 'Key Files',
    desc: 'Entry points, routing & core logic explained',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.2)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'How to Run',
    desc: 'Beginner-friendly setup with real commands',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.2)',
  },
];

const stats = [
  { value: '< 30s', label: 'Analysis time', color: '#F5A623' },
  { value: '< 200ms', label: 'Cached response', color: '#60a5fa' },
  { value: '1 hr', label: 'Cache duration', color: '#4ade80' },
  { value: '∞', label: 'Public repos', color: '#a78bfa' },
];

const steps = [
  { step: '01', label: 'Paste GitHub URL', desc: 'Any public repository works', color: '#F5A623' },
  { step: '02', label: 'AI Analyzes Repo', desc: 'Reads code, structure & README', color: '#a78bfa' },
  { step: '03', label: 'Get Full Breakdown', desc: 'Summary, files, guide — instant', color: '#4ade80' },
];

// ── Logo SVG component ─────────────────────────────────────────────────────────
function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left brace — white */}
      <path
        d="M42 8 C30 8 25 14 25 24 L25 42 C25 49 20 53 14 56 C20 59 25 63 25 70 L25 88 C25 98 30 104 42 104"
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right brace — amber */}
      <path
        d="M58 8 C70 8 75 14 75 24 L75 42 C75 49 80 53 86 56 C80 59 75 63 75 70 L75 88 C75 98 70 104 58 104"
        stroke="#F5A623"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function App() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (url: string) => {
    setError(null);
    setAnalysis(null);
    setFromCache(false);

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError('Invalid GitHub URL. Example: https://github.com/facebook/react');
      setStatus('error');
      return;
    }

    const cached = getCachedAnalysis(url);
    if (cached) {
      setAnalysis(cached);
      setFromCache(true);
      setStatus('done');
      return;
    }

    try {
      setStatus('fetching');
      const { owner, repo } = parsed;
      const repoInfo = await fetchRepoInfo(owner, repo);
      const tree = await fetchRepoTree(owner, repo, repoInfo.default_branch);
      const readme = await fetchReadme(owner, repo);

      setStatus('analyzing');
      const fileContext = await gatherRepoContext(owner, repo, tree);
      const result = await analyzeRepository(
        owner, repo,
        repoInfo.description || '',
        repoInfo.language,
        repoInfo.topics || [],
        tree, readme, fileContext, url
      );

      setCachedAnalysis(url, result);
      setAnalysis(result);
      setFromCache(false);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred.');
      setStatus('error');
    }
  }, []);

  const handleReset = useCallback(() => {
    setStatus('idle');
    setAnalysis(null);
    setError(null);
    setFromCache(false);
  }, []);

  const isLoading = status === 'fetching' || status === 'analyzing';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a', fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-20">

        {/* ── HERO ── */}
        {(status === 'idle' || status === 'error') && (
          <div className="pt-12 sm:pt-20 pb-8">

            {/* Ambient glow */}
            <div
              className="fixed pointer-events-none select-none"
              style={{
                top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '600px', height: '400px',
                background: 'radial-gradient(ellipse at center, rgba(245,166,35,0.05) 0%, rgba(124,58,237,0.04) 50%, transparent 75%)',
                filter: 'blur(60px)',
              }}
            />

            <div className="text-center relative">

              {/* Logo mark */}
              <div className="flex flex-col items-center gap-4 mb-8 animate-fadeUp">
                <div
                  className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl"
                  style={{
                    background: '#0f0f0f',
                    border: '1px solid #1e1e1e',
                    boxShadow: '0 0 40px rgba(245,166,35,0.07)',
                  }}
                >
                  <LogoMark size={44} />
                </div>

                {/* Status pill */}
                <div
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium"
                  style={{ background: '#111', border: '1px solid #1e1e1e', color: '#52525b' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: '#4ade80' }} />
                  <span className="hidden sm:inline">AI-Powered Repository Analysis</span>
                  <span className="sm:hidden">AI-Powered Analysis</span>
                </div>
              </div>

              {/* Headline */}
              <h1
                className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-5 animate-fadeUp stagger-1 px-2"
                style={{ opacity: 0 }}
              >
                Understand any
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #F5A623 0%, #f87171 40%, #a78bfa 80%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  GitHub repo
                </span>
                {' '}in seconds
              </h1>

              <p
                className="text-sm sm:text-lg leading-relaxed max-w-md sm:max-w-xl mx-auto mb-8 sm:mb-10 animate-fadeUp stagger-2 px-4 sm:px-0"
                style={{ color: '#52525b', opacity: 0 }}
              >
                Paste any public GitHub URL and get an instant AI-generated breakdown —
                structure, purpose, key files, and how to run it.
              </p>

              {/* URL Input */}
              <div className="animate-fadeUp stagger-3" style={{ opacity: 0 }}>
                <UrlInput onAnalyze={handleAnalyze} loading={isLoading} />
              </div>

              {/* Error */}
              {status === 'error' && error && (
                <div
                  className="mt-5 flex items-start gap-3 p-4 rounded-2xl text-left max-w-2xl mx-auto animate-fadeUp"
                  style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#f87171' }}>Analysis Failed</p>
                    <p className="text-xs mt-1 leading-relaxed break-words" style={{ color: 'rgba(239,68,68,0.65)' }}>{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Feature Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-12 sm:mt-14">
              {features.map((f, i) => (
                <div
                  key={f.label}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl animate-fadeUp stagger-${i + 2} transition-all duration-300 cursor-default`}
                  style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', opacity: 0 }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = f.border;
                    (e.currentTarget as HTMLDivElement).style.background = f.bg;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a';
                    (e.currentTarget as HTMLDivElement).style.background = '#0f0f0f';
                  }}
                >
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3"
                    style={{ background: f.bg, border: `1px solid ${f.border}`, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white mb-1">{f.label}</p>
                  <p className="text-xs leading-relaxed hidden sm:block" style={{ color: '#3f3f46' }}>{f.desc}</p>
                </div>
              ))}
            </div>

            {/* ── Stats Row ── */}
            <div
              className="mt-2 sm:mt-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
              style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-lg sm:text-xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  <span className="text-xs" style={{ color: '#2a2a2a' }}>{stat.label}</span>
                </div>
              ))}
            </div>

            {/* ── How It Works ── */}
            <div className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl"
                  style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
                >
                  <span
                    className="text-xl sm:text-2xl font-black flex-shrink-0 select-none"
                    style={{ color: '#1e1e1e', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {item.step}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate">{item.label}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#3f3f46' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {isLoading && (
          <div className="pt-10 sm:pt-12">
            <LoadingState status={status as 'fetching' | 'analyzing'} />
          </div>
        )}

        {/* ── RESULTS ── */}
        {status === 'done' && analysis && (
          <div className="pt-4 sm:pt-6">
            <ResultPanel analysis={analysis} onReset={handleReset} fromCache={fromCache} />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        className="py-5 sm:py-6 text-center"
        style={{ borderTop: '1px solid #111' }}
      >
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <LogoMark size={18} />
          <span className="text-xs font-semibold" style={{ color: '#3f3f46' }}>Code Navigator</span>
        </div>
        <p className="text-xs px-4" style={{ color: '#1e1e1e' }}>
          AI-powered GitHub repository analysis · Results cached for 1 hour
        </p>
      </footer>
    </div>
  );
}
