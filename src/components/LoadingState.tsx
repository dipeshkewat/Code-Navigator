interface Props {
  status: 'fetching' | 'analyzing';
}

const steps = [
  {
    id: 'fetching',
    label: 'Fetching repository',
    sub: 'Pulling files, tree & README from GitHub',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    id: 'analyzing',
    label: 'AI Analysis',
    sub: 'Generating structured breakdown with AI',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
  },
];

export default function LoadingState({ status }: Props) {
  const currentIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="w-full max-w-sm mx-auto mt-16 px-4 animate-fadeIn">

      {/* Central orb */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-16 h-16 mb-6">
          {/* Pulsing rings */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: 'rgba(124,58,237,0.15)',
              animation: 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
            }}
          />
          <span
            className="absolute inset-1 rounded-full"
            style={{
              background: 'rgba(124,58,237,0.1)',
              animation: 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) 0.4s infinite',
            }}
          />
          {/* Core */}
          <div
            className="absolute inset-3 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <svg className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '1.5s' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>

        <h2 className="text-white font-semibold text-lg tracking-tight">Analyzing Repository</h2>
        <p className="text-sm mt-1" style={{ color: '#52525b' }}>Usually takes 15–30 seconds</p>
      </div>

      {/* Step cards */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          const isPending = i > currentIndex;

          return (
            <div
              key={step.id}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-500"
              style={{
                background: isActive ? 'rgba(124,58,237,0.08)' : '#141414',
                border: `1px solid ${isActive ? 'rgba(124,58,237,0.3)' : isDone ? '#2a2a2a' : '#1f1f1f'}`,
                opacity: isPending ? 0.4 : 1,
              }}
            >
              {/* Icon / check */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isDone
                    ? 'rgba(52,211,153,0.12)'
                    : isActive
                    ? 'rgba(124,58,237,0.2)'
                    : '#1f1f1f',
                  color: isDone ? '#34d399' : isActive ? '#a78bfa' : '#3f3f46',
                }}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{ color: isActive ? '#ffffff' : isDone ? '#a1a1aa' : '#52525b' }}
                >
                  {step.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#3f3f46' }}>{step.sub}</p>
              </div>

              {/* Active dots */}
              {isActive && (
                <div className="flex gap-1 flex-shrink-0">
                  {[0, 1, 2].map(dot => (
                    <span
                      key={dot}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: '#8b5cf6',
                        animation: `bounce-dot 1.2s ease-in-out ${dot * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
