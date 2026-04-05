import { useState, useEffect } from 'react';

const METRICS = [
  { label: 'Docs Verified',    value: 2847,  suffix: '',   color: '#22d3ee' },
  { label: 'Accuracy Rate',    value: 99.1,  suffix: '%',  color: '#a78bfa' },
  { label: 'Conflicts Caught', value: 134,   suffix: '',   color: '#fb923c' },
  { label: 'Latency (avg)',    value: 1.2,   suffix: 's',  color: '#4ade80' },
];

const FEATURES = [
  {
    icon: '🛡️',
    title: 'Hallucination Guard',
    desc: 'Every answer is mathematically verified against your source documents before delivery.',
    tag: 'Sentinel V2',
    color: 'cyan',
  },
  {
    icon: '⏱️',
    title: 'Temporal Trust Decay',
    desc: 'Automatically detects and flags outdated sources when multiple documents conflict on dates.',
    tag: 'Auto-detect',
    color: 'violet',
  },
  {
    icon: '📊',
    title: 'Multi-Doc Cross-Validation',
    desc: 'Compares evidence nodes across all uploaded documents to surface contradictions in real time.',
    tag: 'Real-time',
    color: 'amber',
  },
  {
    icon: '🔒',
    title: 'Strict Mode',
    desc: 'Enterprise-grade threshold enforcement — answers below 80% confidence are automatically withheld.',
    tag: 'SOC2 Ready',
    color: 'emerald',
  },
];

const TRUST_BADGES = ['SOC2 Type II', 'End-to-End Encrypted', 'GDPR Compliant', 'ISO 27001'];

function AnimatedCounter({ target, suffix, color, duration = 1800 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(+(target * ease).toFixed(target % 1 !== 0 ? 1 : 0));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return (
    <span style={{ color }} className="font-light tabular-nums">
      {val}{suffix}
    </span>
  );
}

const colorMap = {
  cyan:    'from-cyan-500/10  to-cyan-500/5  border-cyan-500/20  text-cyan-400',
  violet:  'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400',
  amber:   'from-amber-500/10 to-amber-500/5  border-amber-500/20  text-amber-400',
  emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
};

export default function LandingPage({ onEnter }) {
  const [hovered, setHovered] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden relative text-white">

      {/* ── Background orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-8%]  w-[60vw] h-[60vw] rounded-full bg-cyan-500/[0.05]   blur-[140px] animate-orb-float" />
        <div className="absolute bottom-[-25%] right-[-8%] w-[55vw] h-[55vw] rounded-full bg-indigo-500/[0.05] blur-[150px] animate-orb-float" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[45%] left-[42%] w-[30vw] h-[30vw] rounded-full bg-violet-500/[0.03] blur-[120px] animate-orb-float" style={{ animationDelay: '-9s' }} />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Nav bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-30 h-16 flex items-center px-8 justify-between border-b border-white/[0.05] glass">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg glass-strong flex items-center justify-center text-sm shadow-[0_0_16px_rgba(34,211,238,0.15)]">🛡️</div>
          <span className="text-base font-light tracking-wide text-white">TrustLayer</span>
          <span className="ml-1 text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-500 border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 rounded-sm">Enterprise</span>
        </div>
        <div className="flex items-center gap-6">
          {['Product', 'Security', 'Docs', 'Pricing'].map(item => (
            <button key={item} className="text-[13px] text-gray-400 hover:text-white transition-colors hidden md:block">{item}</button>
          ))}
          <button
            onClick={onEnter}
            className="text-[13px] px-4 py-1.5 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors"
          >
            Launch App →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className={`relative z-10 flex flex-col items-center pt-40 pb-24 px-6 text-center transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>

        {/* Status pill */}
        <div className="inline-flex items-center gap-2.5 glass px-4 py-2 rounded-full border border-white/8 mb-10 animate-float-badge">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="text-[11px] text-cyan-200 font-medium tracking-wider uppercase">All Systems Operational · v2.4.1</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-extralight tracking-[-0.04em] leading-[0.95] mb-8 max-w-4xl">
          Intelligence,{' '}
          <span
            className="font-medium"
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #22d3ee 50%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Verified.
          </span>
        </h1>

        <p className="text-gray-400 text-xl md:text-2xl font-light max-w-2xl leading-relaxed mb-12">
          The only enterprise RAG framework with mathematical hallucination guards,<br className="hidden md:block" />
          temporal trust decay, and real-time cross-document validation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24">
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium text-[15px] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]"
          >
            <span className="relative z-10">Initialize Workspace</span>
            <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all text-[15px] font-light">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Watch Demo
          </button>
        </div>

        {/* ── Metrics Bar ── */}
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {METRICS.map((m, i) => (
            <div key={i} className="glass-liquid rounded-2xl p-5 flex flex-col gap-1 hover:scale-[1.02] transition-transform">
              <span className="text-3xl font-extralight">
                <AnimatedCounter target={m.value} suffix={m.suffix} color={m.color} duration={1600 + i * 150} />
              </span>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{m.label}</span>
            </div>
          ))}
        </div>

        {/* ── Features Grid ── */}
        <div className="w-full max-w-4xl mb-24">
          <p className="text-[11px] text-gray-500 uppercase tracking-[0.25em] font-medium mb-8">Core Capabilities</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => {
              const cls = colorMap[f.color];
              return (
                <div
                  key={i}
                  className={`glass-liquid rounded-2xl p-6 text-left group hover:scale-[1.01] transition-all duration-300 cursor-default border ${hovered === i ? 'border-white/12' : 'border-white/[0.06]'}`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cls.split(' ').slice(0,2).join(' ')} border ${cls.split(' ')[2]} flex items-center justify-center flex-shrink-0 text-lg`}>
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-[15px] font-medium text-white">{f.title}</h3>
                        <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${cls.split(' ').slice(2).join(' ')} bg-transparent`}>{f.tag}</span>
                      </div>
                      <p className="text-[13px] text-gray-400 font-light leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mock UI Preview ── */}
        <div className="w-full max-w-4xl mb-24">
          <p className="text-[11px] text-gray-500 uppercase tracking-[0.25em] font-medium mb-8">Live System Preview</p>
          <div className="glass-liquid rounded-3xl overflow-hidden border border-white/[0.07]">
            {/* fake window chrome */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70"></span>
              <span className="ml-4 text-[11px] text-gray-600 font-mono">trustlayer.enterprise · Verification Console</span>
            </div>
            <div className="p-6 space-y-4">
              {/* fake user msg */}
              <div className="flex justify-end">
                <div className="glass border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[70%]">
                  <p className="text-[13px] text-gray-200 font-light">What are the leave entitlements under the 2024 HR policy?</p>
                </div>
              </div>
              {/* fake AI response */}
              <div className="flex justify-start">
                <div className="glass-strong border border-white/8 rounded-2xl rounded-tl-sm p-5 max-w-[90%] space-y-3">
                  <p className="text-[13px] text-gray-300 font-light leading-relaxed">
                    Under the <strong className="text-white">2024 HR Policy (v3.1)</strong>, employees are entitled to <strong className="text-white">24 days</strong> of annual leave, 12 days of sick leave, and up to 5 days of compassionate leave per calendar year.
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                      <span>Cosine Relevance</span>
                      <span className="text-cyan-400">94% Trust Score</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[94%] bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 8px rgba(34,211,238,0.5)' }} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-cyan-500/20 text-cyan-400 bg-cyan-500/5">📄 HR_Policy_2024.pdf</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-white/10 text-gray-500 bg-white/5">PG. 12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trust Badges ── */}
        <div className="flex flex-wrap gap-6 justify-center items-center opacity-40 mb-8">
          {TRUST_BADGES.map((b, i) => (
            <span key={i} className="text-[11px] text-gray-400 font-mono uppercase tracking-[0.2em]">{b}</span>
          ))}
        </div>
        <p className="text-xs text-gray-600 font-light">© 2024 TrustLayer Inc. · All responses are mathematically grounded · No hallucination guarantee</p>
      </div>
    </div>
  );
}
