import React from 'react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-4xl p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden">
        
        {/* Background glow Decorator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl text-white font-light tracking-widest uppercase">Sentinel Architecture</h2>
           <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-2xl font-mono">×</button>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
           
           {/* Section 1: Ingestion */}
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs tracking-tighter">
                 <span className="w-6 h-6 rounded-full border border-cyan-500/30 flex items-center justify-center text-[10px]">01</span>
                 HIGH-DIM VECTOR INGESTION
              </div>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                 Source PDFs are passed through a local **Sentence-BERT Bi-Encoder** (`all-MiniLM-L6-v2`). We create an L2 Normalized 384-dimensional vector space stored in an **on-device FAISS cache**.
              </p>
              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                 <div className="h-1 bg-white/10 rounded-full w-full relative overflow-hidden">
                    <div className="h-full bg-cyan-500 w-3/4 animate-pulse"></div>
                 </div>
                 <span className="text-[10px] text-gray-500 font-mono">ENCODING PHASE: L2 EUCLIDEAN DISTANCE INDEXING...</span>
              </div>
           </div>

           {/* Section 2: Sentinel Generation */}
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs tracking-tighter">
                 <span className="w-6 h-6 rounded-full border border-cyan-500/30 flex items-center justify-center text-[10px]">02</span>
                 THE SENTINEL GROUNDING PROTOCOL
              </div>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                 Instead of blind generation, TrustLayer intercepts user queries at the **Sentinel Layer**. We only allow the AI to process mathematically-validated data nodes, preventing any hallucination from base training.
              </p>
              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                 <div className="flex gap-1 justify-center items-end h-6">
                    {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                       <div key={i} className="w-1 bg-cyan-500/50 rounded-full animate-bounce" style={{ height: `${h}%`, animationDelay: `${i*0.1}s` }}></div>
                    ))}
                 </div>
                 <span className="text-[10px] text-gray-500 font-mono text-center">VALIDATING DATA NODES... TRUST SCORE: 99.8%</span>
              </div>
           </div>

        </div>

        <div className="mt-12 flex justify-center">
           <button 
             onClick={onClose}
             className="px-10 py-3 bg-white text-black rounded-full font-bold hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1"
           >
             Exit Architecture Console
           </button>
        </div>

      </div>
    </div>
  );
}
