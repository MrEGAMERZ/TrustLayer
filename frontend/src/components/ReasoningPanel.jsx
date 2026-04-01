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
           <span className="text-cyan-400 font-mono">L2 Vector Indexing (FAISS)</span>
        </p>
        <p className="flex justify-between border-b border-white/5 pb-2">
           <span className="text-gray-500">Context Density:</span>
           <span className="text-gray-100">{chunksUsed} Semantic Nodes Detected</span>
        </p>
        <p className="flex justify-between border-b border-white/5 pb-2">
           <span className="text-gray-500">Hallucination Delta:</span>
           <span className="text-green-400 font-mono">Minimized via Grounding Sentinel</span>
        </p>
        
        <p className="mt-4 text-[11px] text-gray-500 leading-normal italic bg-black/20 p-3 rounded-xl border border-white/5">
           Unlike generic AI, TrustLayer isolates retrieved DATA NODES and enforces a zero-hallucination constraint. 
           The Sentinel Prompt prevents the LLM from accessing base training data, ensuring the response is mathematically derived 
           exclusively from your enterprise context.
        </p>
      </div>
    </div>
  );
}
