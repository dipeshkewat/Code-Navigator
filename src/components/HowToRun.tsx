interface Props {
  steps: string[];
}

const stepAccents = [
  { color: '#F5A623', bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.3)' },
  { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
  { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' },
  { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.3)' },
  { color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)' },
  { color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.3)' },
];

function parseStep(raw: string): { heading: string; body: string; commands: string[] } {
  // Remove leading step number/emoji like "1️⃣ " or "Step 1:" or "1."
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^(step\s*\d+\s*[:.]?\s*|[\d]+[.):]\s*|[1-9]️⃣\s*|[🔢]\s*)/i, '');

  // Extract heading (text before colon or first sentence)
  const colonIdx = cleaned.indexOf(':');
  const heading = colonIdx > 0 && colonIdx < 60 ? cleaned.slice(0, colonIdx).trim() : cleaned.slice(0, 50).trim();
  const rest = colonIdx > 0 && colonIdx < 60 ? cleaned.slice(colonIdx + 1).trim() : cleaned;

  // Extract inline code blocks (backtick wrapped)
  const commands: string[] = [];
  const body = rest.replace(/`([^`]+)`/g, (_, code) => {
    commands.push(code);
    return `__CMD_${commands.length - 1}__`;
  });

  return { heading, body, commands };
}

function renderBody(body: string, commands: string[]) {
  const parts = body.split(/(\_\_CMD\_\d+\_\_)/g);
  return parts.map((part, i) => {
    const match = part.match(/^__CMD_(\d+)__$/);
    if (match) {
      const cmd = commands[parseInt(match[1])];
      return (
        <code
          key={i}
          className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs mx-0.5"
          style={{
            background: '#0a0a0a',
            border: '1px solid #222',
            color: '#4ade80',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {cmd}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// Detect if a step is purely a command (starts with common CLI prefixes)
function extractTopLevelCommand(raw: string): string | null {
  const trimmed = raw.trim();
  const cmdPatterns = [
    /^(git\s|npm\s|yarn\s|pip\s|python\s|node\s|docker\s|cd\s|mkdir\s|cp\s|mv\s|curl\s|\$\s)/i,
  ];
  // Check if after removing step number there's a pure command
  const cleaned = trimmed.replace(/^(step\s*\d+\s*[:.]?\s*|[\d]+[.):]\s*|[1-9]️⃣\s*)/i, '');
  // Look for command in backticks
  const backtickMatch = cleaned.match(/`([^`]+)`/);
  if (backtickMatch) return backtickMatch[1];
  // Look for bare command
  for (const p of cmdPatterns) {
    if (p.test(cleaned)) return cleaned.replace(/^[$>]\s*/, '');
  }
  return null;
}

export default function HowToRun({ steps }: Props) {
  return (
    <div className="space-y-3">
      {steps.map((step, idx) => {
        const accent = stepAccents[idx % stepAccents.length];
        const { heading, body, commands } = parseStep(step);
        const topCmd = extractTopLevelCommand(step);

        return (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden transition-all duration-200"
            style={{ border: '1px solid #1a1a1a' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = accent.border; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a'; }}
          >
            {/* Step header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: '#111', borderBottom: '1px solid #1a1a1a' }}
            >
              {/* Step number circle */}
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
              >
                {idx + 1}
              </div>
              <h4 className="text-sm font-semibold text-white">{heading || `Step ${idx + 1}`}</h4>
            </div>

            {/* Body */}
            <div className="px-4 py-3" style={{ background: '#0d0d0d' }}>
              {body && body.replace(/__CMD_\d+__/g, '').trim() && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: '#71717a' }}>
                  {renderBody(body, commands)}
                </p>
              )}

              {/* Command block */}
              {(topCmd || commands.length > 0) && (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}
                >
                  {/* Terminal prompt */}
                  <span className="text-xs flex-shrink-0 font-bold" style={{ color: '#3f3f46', fontFamily: "'JetBrains Mono', monospace" }}>$</span>
                  <code
                    className="text-xs flex-1 leading-relaxed"
                    style={{ color: '#4ade80', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {topCmd || commands.join(' && ')}
                  </code>
                  {/* Copy hint */}
                  <span className="text-xs flex-shrink-0" style={{ color: '#2a2a2a' }}>copy</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Footer tip */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl mt-4"
        style={{ background: 'rgba(245,166,35,0.04)', border: '1px solid rgba(245,166,35,0.1)' }}
      >
        <span className="text-base">💡</span>
        <p className="text-xs leading-relaxed" style={{ color: '#52525b' }}>
          If you run into issues, check that you have the correct runtime installed (Node.js, Python, etc.) 
          and that all environment variables are set correctly before running.
        </p>
      </div>
    </div>
  );
}
