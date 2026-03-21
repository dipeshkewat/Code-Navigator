import type { FunctionItem } from '../types';

const typeConfig: Record<FunctionItem['type'], { label: string; color: string; bg: string; border: string }> = {
  function:  { label: 'fn',    color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)'  },
  class:     { label: 'class', color: '#c084fc', bg: 'rgba(192,132,252,0.1)',  border: 'rgba(192,132,252,0.25)' },
  component: { label: 'comp',  color: '#22d3ee', bg: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.25)'   },
  other:     { label: 'file',  color: '#F5A623', bg: 'rgba(245,166,35,0.08)',  border: 'rgba(245,166,35,0.2)'   },
};

const roleConfig: Record<string, { label: string; color: string; icon: string }> = {
  'entry-point': { label: 'Entry Point',  color: '#F5A623', icon: '⚡' },
  'routing':     { label: 'Routing',      color: '#60a5fa', icon: '🔀' },
  'core-logic':  { label: 'Core Logic',   color: '#a78bfa', icon: '🧠' },
  'model':       { label: 'Model',        color: '#4ade80', icon: '🗄️' },
  'controller':  { label: 'Controller',   color: '#22d3ee', icon: '🎮' },
  'config':      { label: 'Config',       color: '#fbbf24', icon: '⚙️' },
  'utility':     { label: 'Utility',      color: '#a1a1aa', icon: '🔧' },
  'other':       { label: 'Other',        color: '#52525b', icon: '📄' },
};

interface Props {
  functions: FunctionItem[];
}

export default function FunctionList({ functions }: Props) {
  return (
    <div className="space-y-2.5">
      {functions.map((fn, idx) => {
        const cfg = typeConfig[fn.type] || typeConfig.other;
        const roleCfg = fn.role ? (roleConfig[fn.role] || roleConfig.other) : null;

        return (
          <div
            key={idx}
            className="rounded-2xl p-4 transition-all duration-200"
            style={{ background: '#111', border: '1px solid #1a1a1a' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a';
              (e.currentTarget as HTMLDivElement).style.background = '#141414';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a';
              (e.currentTarget as HTMLDivElement).style.background = '#111';
            }}
          >
            <div className="flex items-start gap-3">
              {/* Type badge */}
              <span
                className="flex-shrink-0 text-xs font-mono font-bold px-2.5 py-1 rounded-lg mt-0.5"
                style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                {cfg.label}
              </span>

              <div className="min-w-0 flex-1">
                {/* Name + role */}
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className="text-sm font-bold"
                    style={{ color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {fn.name}
                  </p>
                  {roleCfg && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${roleCfg.color}12`,
                        color: roleCfg.color,
                        border: `1px solid ${roleCfg.color}25`,
                      }}
                    >
                      {roleCfg.icon} {roleCfg.label}
                    </span>
                  )}
                </div>

                {/* File path */}
                <div className="flex items-center gap-1.5 mt-1">
                  <svg className="w-3 h-3 flex-shrink-0" style={{ color: '#3f3f46' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p
                    className="text-xs"
                    style={{ color: '#3f3f46', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {fn.file}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs mt-2 leading-relaxed" style={{ color: '#71717a' }}>
                  {fn.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
