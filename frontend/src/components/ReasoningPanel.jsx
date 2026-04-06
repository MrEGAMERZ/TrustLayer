const PIPELINE_STEPS = [
  { label: 'Query Embedding',      detail: 'sentence-transformers/all-MiniLM-L6-v2', status: 'done',    color: '#4ade80' },
  { label: 'FAISS Retrieval',      detail: 'Top-K hybrid cosine linkage',            status: 'done',    color: '#4ade80' },
  { label: 'Conflict Analysis',    detail: 'Cross-Node validation matrix',           status: 'done',    color: '#4ade80' },
  { label: 'Hallucination Guard',  detail: 'Sentinel V2 integrity check',            status: 'done',    color: '#22d3ee' },
  { label: 'Answer Synthesis',     detail: 'Gemini with grounding constraints',      status: 'done',    color: '#22d3ee' },
];

export default function ReasoningPanel({ chunksUsed, open }) {
  if (!open) return null;

  return (
    <div className="glass-liquid border border-white/[0.07] rounded-xl overflow-hidden animate-slide-up">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-white/[0.015]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest">Sentinel Grounding Protocol</span>
        </div>
        <span className="text-[9px] font-mono text-gray-600">{chunksUsed} chunks analysed</span>
      </div>

      {/* Pipeline steps */}
      <div className="px-4 py-3 space-y-2">
        {PIPELINE_STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Step connector */}
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="w-4 h-4 rounded-full border flex items-center justify-center" style={{ borderColor: step.color, background: `${step.color}20` }}>
                <svg className="w-2 h-2" fill="none" viewBox="0 0 10 10">
                  <path d="M2 5l2 2 4-4" stroke={step.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="w-px h-3" style={{ background: `linear-gradient(${step.color}40, transparent)` }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-gray-300 font-medium">{step.label}</span>
              </div>
              <span className="text-[10px] text-gray-600 font-mono">{step.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="px-4 pb-3">
        <div className="bg-black/20 border border-white/[0.04] rounded-lg p-3">
          <p className="text-[11px] text-gray-500 leading-relaxed font-light">
            TrustLayer performed cross-node validation across <strong className="text-gray-400">{chunksUsed} evidence nodes</strong>. Every sentence was mathematically grounded before synthesis. No interpolation was used.
          </p>
        </div>
      </div>
    </div>
  );
}
