import { useState } from 'react';
import type { RepoAnalysis } from '../types';
import FolderTree from './FolderTree';
import FunctionList from './FunctionList';
import HowToRun from './HowToRun';
import { getCacheAgeString } from '../utils/cache';

interface Props {
  analysis: RepoAnalysis;
  onReset: () => void;
  fromCache: boolean;
}

const tabs = [
  {
    id: 'summary',
    label: 'Summary',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    id: 'structure',
    label: 'Structure',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    id: 'functions',
    label: 'Key Files',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'howtorun',
    label: 'How to Run',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const techColors = [
  { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
  { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)'  },
  { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.25)'  },
  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)'  },
  { color: '#F5A623', bg: 'rgba(245,166,35,0.1)',  border: 'rgba(245,166,35,0.25)'  },
  { color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.25)' },
  { color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)'  },
  { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)'  },
];

function SectionHeader({ accent, title, subtitle }: { accent: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-1 h-full min-h-[36px] rounded-full flex-shrink-0 mt-0.5" style={{ background: accent }} />
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#52525b' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent: string }) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-2xl"
      style={{ background: '#111', border: '1px solid #1e1e1e' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}15`, color: accent }}>
          {icon}
        </div>
        <span className="text-xs font-medium" style={{ color: '#52525b' }}>{label}</span>
      </div>
      <span className="text-xl font-bold" style={{ color: accent }}>{value}</span>
    </div>
  );
}

export default function ResultPanel({ analysis, onReset, fromCache }: Props) {
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="w-full animate-fadeIn space-y-4">

      {/* ── Repo Header Card ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-2xl"
        style={{ background: '#111', border: '1px solid #1e1e1e' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* GitHub avatar */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#1a1a1a', border: '1px solid #222' }}
          >
            <svg className="w-5 h-5" style={{ color: '#a1a1aa' }} viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-white font-bold text-base leading-tight">
                <span style={{ color: '#52525b' }}>{analysis.owner}</span>
                <span style={{ color: '#333' }}>{' / '}</span>
                <span style={{ color: '#ffffff' }}>{analysis.repoName}</span>
              </h2>
              {analysis.tagline && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium hidden sm:inline"
                  style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623' }}
                >
                  {analysis.tagline}
                </span>
              )}
            </div>
            <a
              href={analysis.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs truncate block transition-colors mt-0.5"
              style={{ color: '#3f3f46', fontFamily: "'JetBrains Mono', monospace" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#F5A623'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#3f3f46'}
            >
              {analysis.repoUrl.replace('https://', '')} ↗
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {fromCache && (
            <span
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Cached · {getCacheAgeString(analysis.analyzedAt)}
            </span>
          )}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: '#1a1a1a', border: '1px solid #222', color: '#a1a1aa' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#222';
              (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#333';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a';
              (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#222';
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            New Analysis
          </button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div
        className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
        style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex-1 justify-center whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? '#1a1a1a' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#52525b',
              border: activeTab === tab.id ? '1px solid #2a2a2a' : '1px solid transparent',
            }}
          >
            <span style={{ color: activeTab === tab.id ? '#F5A623' : '#52525b' }}>{tab.icon}</span>
            <span className="hidden xs:inline sm:inline" style={{ fontSize: '0.7rem' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
      >

        {/* ════════════════════════════════════════
            SUMMARY TAB — rich, structured
        ════════════════════════════════════════ */}
        {activeTab === 'summary' && (
          <div className="space-y-8 animate-fadeIn">

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoCard
                accent="#60a5fa"
                label="Key Files"
                value={analysis.functions.length}
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
              />
              <InfoCard
                accent="#a78bfa"
                label="Tech Stack"
                value={analysis.techStack.length}
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
              />
              <InfoCard
                accent="#4ade80"
                label="Run Steps"
                value={analysis.howToRun.length}
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>}
              />
              <InfoCard
                accent="#F5A623"
                label="Folders"
                value={analysis.folderStructure.filter(f => f.type === 'dir').length}
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
              />
            </div>

            {/* ── What is the Project ── */}
            <div
              className="p-5 rounded-2xl"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}
                >
                  <svg className="w-4 h-4" style={{ color: '#a78bfa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">What is this Project?</h3>
                  <p className="text-xs" style={{ color: '#3f3f46' }}>Project overview & context</p>
                </div>
              </div>
              <p className="text-sm leading-7" style={{ color: '#a1a1aa' }}>
                {analysis.summary}
              </p>
            </div>

            {/* ── Purpose ── */}
            {analysis.purpose && (
              <div
                className="p-5 rounded-2xl"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.2)' }}
                  >
                    <svg className="w-4 h-4" style={{ color: '#F5A623' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Purpose & Use Case</h3>
                    <p className="text-xs" style={{ color: '#3f3f46' }}>Why this project exists</p>
                  </div>
                </div>
                <p className="text-sm leading-7" style={{ color: '#a1a1aa' }}>
                  {analysis.purpose}
                </p>
              </div>
            )}

            {/* ── How It Works ── */}
            {analysis.howItWorks && (
              <div
                className="p-5 rounded-2xl"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.2)' }}
                  >
                    <svg className="w-4 h-4" style={{ color: '#22d3ee' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">How It Works</h3>
                    <p className="text-xs" style={{ color: '#3f3f46' }}>Internal mechanics & flow</p>
                  </div>
                </div>
                <p className="text-sm leading-7" style={{ color: '#a1a1aa' }}>
                  {analysis.howItWorks}
                </p>
              </div>
            )}

            {/* ── Tech Stack ── */}
            {analysis.techStack.length > 0 && (
              <div>
                <SectionHeader
                  accent="linear-gradient(to bottom, #0ea5e9, #22d3ee)"
                  title="Tech Stack"
                  subtitle={`${analysis.techStack.length} technologies detected`}
                />

                {/* Tech badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {analysis.techStack.map((tech, idx) => {
                    const c = techColors[idx % techColors.length];
                    return (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}
                      >
                        {tech}
                      </span>
                    );
                  })}
                </div>

                {/* Tech details */}
                {analysis.techDetails && analysis.techDetails.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.techDetails.map((td, idx) => {
                      const c = techColors[idx % techColors.length];
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl"
                          style={{ background: '#111', border: '1px solid #1a1a1a' }}
                        >
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: c.color }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold" style={{ color: c.color }}>{td.name}</span>
                            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#52525b' }}>{td.role}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            STRUCTURE TAB
        ════════════════════════════════════════ */}
        {activeTab === 'structure' && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <SectionHeader
                accent="linear-gradient(to bottom, #F5A623, #f59e0b)"
                title="Folder & File Structure"
                subtitle="Complete repository tree with AI-generated descriptions"
              />
              <span
                className="text-xs px-3 py-1.5 rounded-xl flex-shrink-0 self-start sm:self-auto"
                style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)', color: '#F5A623' }}
              >
                Tap folders to expand
              </span>
            </div>
            {analysis.folderStructure.length > 0 ? (
              <FolderTree items={analysis.folderStructure} />
            ) : (
              <p className="text-sm" style={{ color: '#52525b' }}>No structure data available.</p>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            FUNCTIONS / KEY FILES TAB
        ════════════════════════════════════════ */}
        {activeTab === 'functions' && (
          <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between mb-5 gap-4">
              <SectionHeader
                accent="linear-gradient(to bottom, #60a5fa, #3b82f6)"
                title="Key Files & Components"
                subtitle="Important files identified by AI — entry points, routing, core logic, models"
              />
              <div className="flex gap-1.5 flex-shrink-0">
                {[
                  { label: 'fn',    color: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)'  },
                  { label: 'class', color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
                  { label: 'comp',  color: '#22d3ee', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.2)'   },
                ].map(t => (
                  <span
                    key={t.label}
                    className="text-xs font-mono px-2 py-0.5 rounded-lg"
                    style={{ color: t.color, background: t.bg, border: `1px solid ${t.border}` }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div
              className="p-4 rounded-xl mb-5 flex items-start gap-3"
              style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.12)' }}
            >
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#60a5fa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: '#52525b' }}>
                These are the <span style={{ color: '#60a5fa' }}>most important files</span> in this repository. 
                The AI identified entry points, routing files, core logic, models, and configuration files 
                to help you understand where execution starts and where key logic lives.
              </p>
            </div>

            {analysis.functions.length > 0 ? (
              <FunctionList functions={analysis.functions} />
            ) : (
              <p className="text-sm" style={{ color: '#52525b' }}>No function data available.</p>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            HOW TO RUN TAB
        ════════════════════════════════════════ */}
        {activeTab === 'howtorun' && (
          <div className="animate-fadeIn">
            <SectionHeader
              accent="linear-gradient(to bottom, #4ade80, #22c55e)"
              title="🚀 How to Run This Project"
              subtitle="Beginner-friendly step-by-step guide — follow in order"
            />

            {/* Info strip */}
            <div
              className="p-4 rounded-xl mb-5 flex items-start gap-3"
              style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.12)' }}
            >
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#4ade80' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: '#52525b' }}>
                Steps are <span style={{ color: '#4ade80' }}>auto-generated</span> from the project's README, 
                package.json, and config files. Commands are detected based on project type 
                (Node.js, Python, Docker, etc).
              </p>
            </div>

            {analysis.howToRun.length > 0 ? (
              <HowToRun steps={analysis.howToRun} />
            ) : (
              <p className="text-sm" style={{ color: '#52525b' }}>No run instructions available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
