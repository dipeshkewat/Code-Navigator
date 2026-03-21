import { useState } from 'react';
import type { FolderItem } from '../types';

interface FolderNodeProps {
  item: FolderItem;
  depth?: number;
}

const extColorMap: Record<string, { color: string; bg: string; label: string }> = {
  ts:   { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',   label: 'TS'   },
  tsx:  { color: '#22d3ee', bg: 'rgba(6,182,212,0.12)',    label: 'TSX'  },
  js:   { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',   label: 'JS'   },
  jsx:  { color: '#fde68a', bg: 'rgba(253,230,138,0.1)',   label: 'JSX'  },
  py:   { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',   label: 'PY'   },
  go:   { color: '#67e8f9', bg: 'rgba(103,232,249,0.12)',  label: 'GO'   },
  rs:   { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',   label: 'RS'   },
  json: { color: '#facc15', bg: 'rgba(250,204,21,0.1)',    label: 'JSON' },
  md:   { color: '#d1d5db', bg: 'rgba(209,213,219,0.08)',  label: 'MD'   },
  css:  { color: '#c084fc', bg: 'rgba(192,132,252,0.12)',  label: 'CSS'  },
  scss: { color: '#c084fc', bg: 'rgba(192,132,252,0.12)',  label: 'SCSS' },
  html: { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',   label: 'HTML' },
  yml:  { color: '#f472b6', bg: 'rgba(244,114,182,0.12)',  label: 'YML'  },
  yaml: { color: '#f472b6', bg: 'rgba(244,114,182,0.12)',  label: 'YAML' },
  sh:   { color: '#86efac', bg: 'rgba(134,239,172,0.1)',   label: 'SH'   },
  env:  { color: '#fde68a', bg: 'rgba(253,230,138,0.1)',   label: 'ENV'  },
  toml: { color: '#F5A623', bg: 'rgba(245,166,35,0.1)',    label: 'TOML' },
  java: { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',   label: 'JAVA' },
  rb:   { color: '#f87171', bg: 'rgba(248,113,113,0.12)',  label: 'RB'   },
  php:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',  label: 'PHP'  },
  sql:  { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',   label: 'SQL'  },
  svg:  { color: '#f472b6', bg: 'rgba(244,114,182,0.1)',   label: 'SVG'  },
  png:  { color: '#a1a1aa', bg: 'rgba(161,161,170,0.08)',  label: 'IMG'  },
  lock: { color: '#52525b', bg: 'rgba(82,82,91,0.08)',     label: 'LOCK' },
};

function FileExtBadge({ ext }: { ext: string }) {
  const style = extColorMap[ext.toLowerCase()] || { color: '#71717a', bg: 'rgba(113,113,122,0.08)', label: ext.toUpperCase().slice(0, 4) || 'FILE' };
  return (
    <span
      className="text-xs font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0"
      style={{ color: style.color, background: style.bg, fontSize: '0.6rem', letterSpacing: '0.05em' }}
    >
      {style.label}
    </span>
  );
}

function FileIcon({ ext }: { ext: string }) {
  const style = extColorMap[ext.toLowerCase()] || { color: '#71717a', bg: 'rgba(113,113,122,0.08)', label: '' };
  return (
    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: style.bg }}>
      <svg className="w-3 h-3" style={{ color: style.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,166,35,0.12)' }}>
      <svg className="w-3 h-3" style={{ color: '#F5A623' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {open ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        )}
      </svg>
    </div>
  );
}

function ImportanceDot({ importance }: { importance?: string }) {
  if (!importance || importance === 'low') return null;
  const color = importance === 'high' ? '#F5A623' : '#52525b';
  const title = importance === 'high' ? 'High importance' : 'Medium importance';
  return (
    <div
      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: color }}
      title={title}
    />
  );
}

function FolderNode({ item, depth = 0 }: FolderNodeProps) {
  const [open, setOpen] = useState(depth === 0 || (item.expanded ?? false));
  const ext = item.name.includes('.') ? item.name.split('.').pop() || '' : '';
  const hasChildren = item.type === 'dir' && item.children && item.children.length > 0;

  return (
    <div>
      <div
        className="group flex items-start gap-2 py-1.5 px-2 rounded-xl transition-all duration-150 relative"
        style={{
          paddingLeft: `${depth * 20 + 8}px`,
          cursor: hasChildren ? 'pointer' : 'default',
        }}
        onClick={() => hasChildren && setOpen(o => !o)}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#151515'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        {/* Indent guide line */}
        {depth > 0 && (
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: `${(depth - 1) * 20 + 17}px`,
              width: '1px',
              background: '#1e1e1e',
            }}
          />
        )}

        {/* Chevron */}
        <div className="flex-shrink-0 mt-0.5 w-3 h-3 flex items-center justify-center">
          {item.type === 'dir' && hasChildren ? (
            <svg
              className="w-3 h-3 transition-transform duration-200"
              style={{ color: '#3f3f46', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <div className="w-1 h-1 rounded-full" style={{ background: '#2a2a2a' }} />
          )}
        </div>

        {/* Icon */}
        {item.type === 'dir' ? <FolderIcon open={open} /> : <FileIcon ext={ext} />}

        {/* Name + badge + description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold leading-none"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: item.type === 'dir' ? '#F5A623' : '#e4e4e7',
              }}
            >
              {item.name}
            </span>
            {item.type === 'file' && ext && <FileExtBadge ext={ext} />}
            <ImportanceDot importance={item.importance} />
          </div>
          {item.description && (
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#52525b' }}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Children */}
      {open && hasChildren && (
        <div>
          {item.children!.map((child, idx) => (
            <FolderNode key={`${child.path}-${idx}`} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({ items }: { items: FolderItem[] }) {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-xs" style={{ color: '#3f3f46' }}>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#F5A623' }} />
            High importance
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#52525b' }} />
            Medium
          </span>
        </div>
        <button
          onClick={() => setExpandAll(v => !v)}
          className="text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ background: '#111', border: '1px solid #1e1e1e', color: '#52525b' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#F5A623';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,166,35,0.3)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#52525b';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e1e1e';
          }}
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Tree */}
      <div
        className="rounded-2xl p-3 overflow-auto"
        style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', maxHeight: '520px' }}
      >
        {/* Terminal-style header */}
        <div className="flex items-center gap-1.5 mb-3 pb-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444', opacity: 0.6 }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fbbf24', opacity: 0.6 }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#4ade80', opacity: 0.6 }} />
          <span className="text-xs ml-2" style={{ color: '#3f3f46', fontFamily: "'JetBrains Mono', monospace" }}>
            repository/
          </span>
        </div>

        <div className="space-y-0.5">
          {items.map((item, idx) => (
            <FolderNode key={`${item.path}-${idx}`} item={{ ...item, expanded: expandAll || item.expanded }} depth={0} />
          ))}
        </div>
      </div>

      <p className="text-xs mt-2 text-center" style={{ color: '#2a2a2a' }}>
        {items.length} top-level items · Click folders to expand/collapse
      </p>
    </div>
  );
}
