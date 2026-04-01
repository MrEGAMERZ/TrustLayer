export default function ReasoningPanel({ chunksUsed, open }) {
  if (!open) return null;

  return (
    <div className="mt-4 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl p-5 text-sm text-gray-300 leading-relaxed shadow-2xl relative overflow-hidden animate-fade-in-down">
      
      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
         <span className="text-4xl font-mono">0x7F</span>
      </div>

      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
         <span className="text-cyan-400 font-mono text-xs shadow-[0_0_8px_rgba(6,182,212,0.6)]">SENTINEL_GROUNDING_PROTOCOL</span>
      </div>
      
      <div className="space-y-3 font-light text-xs tracking-wide">
        <p className="flex justify-between border-b border-white/5 pb-2">
           <span className="text-gray-500">Retrieval Pipeline:</span>
           <span className="text-cyan-400 font-mono">FAISS Hybrid Linkage</span>
        </p>
        <p className="flex justify-between border-b border-white/5 pb-2">
           <span className="text-gray-500">Sentinel Version:</span>
           <span className="text-gray-100 italic">V2.0 (Active Grounding)</span>
        </p>
        <p className="flex justify-between border-b border-white/5 pb-2">
           <span className="text-gray-500">Analysis Matrix:</span>
           <span className="text-green-400 font-mono">Cross-Node Conflict Analysis</span>
        </p>
        
        <p className="mt-4 text-[11px] text-gray-500 leading-normal italic bg-black/20 p-3 rounded-xl border border-white/5">
           TrustLayer Sentinel V2 generates a high-integrity response by performing **Cross-Node Validation**. 
           Every retrieved data chunk is mathematically mapped and cross-checked for internal document contradictions 
           before a single sentence is synthesized.
        </p>
      </div>
    </div>
  );
}
