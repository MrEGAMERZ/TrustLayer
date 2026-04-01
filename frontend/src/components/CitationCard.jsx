export default function CitationCard({ citation }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-xl p-4 text-sm shadow-xl hover:bg-white/[0.05] transition-all relative group overflow-hidden">
      <div className="flex gap-2 mb-3 items-center relative z-10">
        <span className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-widest uppercase text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">📄 {citation.doc}</span>
        <span className="bg-white/5 text-gray-400 px-2 py-1 rounded-lg text-[10px] font-mono border border-white/5">PG.{citation.page}</span>
      </div>
      <p className="text-gray-400 italic border-l-2 border-cyan-500/30 pl-4 leading-relaxed font-light relative z-10 group-hover:text-gray-300 transition-colors">
        "{citation.excerpt}"
      </p>
      
      {/* Subtle bottom glow on hover */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-500/0 group-hover:bg-cyan-500/20 transition-all duration-500 blur-sm"></div>
    </div>
  );
}
