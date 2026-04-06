export default function CitationCard({ citation }) {
  return (
    <div className="group relative glass-liquid border border-white/[0.06] rounded-xl p-4 hover:border-white/12 transition-all duration-200 overflow-hidden">

      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-cyan-500/8 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
          <span className="text-[10px]">📄</span>
          <span className="text-[10px] font-mono tracking-wide text-cyan-400 uppercase">{citation.doc}</span>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] px-2 py-1 rounded-lg">
          <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Pg.</span>
          <span className="text-[10px] text-gray-300 font-mono">{citation.page}</span>
        </div>
        {citation.year && (
          <div className="flex items-center gap-1 bg-amber-500/8 border border-amber-500/20 px-2 py-1 rounded-lg ml-auto">
            <span className="text-[9px] text-amber-400/70 font-mono">📅 {citation.year}</span>
          </div>
        )}
      </div>

      {citation.excerpt && (
        <blockquote className="text-[12px] text-gray-400 font-light leading-relaxed border-l-2 border-cyan-500/25 pl-3 italic group-hover:text-gray-300 transition-colors">
          "{citation.excerpt}"
        </blockquote>
      )}

      {/* Hover glow */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-cyan-400/0 group-hover:bg-cyan-400/15 transition-all blur-sm" />
    </div>
  );
}
