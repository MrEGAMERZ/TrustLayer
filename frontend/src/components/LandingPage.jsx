export default function LandingPage({ onEnter }) {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center relative z-10 px-4">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none"></div>

      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center 
                      bg-white/5 backdrop-blur-2xl border border-white/10 
                      p-10 md:p-14 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        
        {/* Subtle noise texture or gradient line on top */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>

        {/* Left Col - Typography & Brand */}
        <div className="flex-1 flex flex-col items-start text-left z-20">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl opacity-80">🛡️</span>
            <span className="text-lg font-medium tracking-[0.2em] text-gray-300 uppercase">TrustLayer</span>
            <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-sm ml-2 font-mono border border-white/5">v1.1</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light text-white leading-[1.1] mb-6 tracking-tight">
            Information.<br/>
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Verified.</span>
          </h1>
          
          <p className="text-[15px] font-light text-gray-400 mb-10 leading-relaxed max-w-sm">
            Not another chatbot. The first mathematically proven truth engine. We map enterprise context through high-dimensional semantic vectors to generate mathematically grounded answers.
          </p>
          
          <button 
            onClick={onEnter}
            className="group relative flex items-center justify-center gap-3 bg-white/10 hover:bg-white/[0.15] text-white px-8 py-3.5 rounded-full font-medium transition-all duration-300 border border-white/10 hover:border-white/20 overflow-hidden"
          >
            <div className="absolute inset-0 w-1/4 h-full bg-white/10 skew-x-[45deg] group-hover:translate-x-[400%] transition-transform duration-700 ease-out"></div>
            Authenticate Session <span className="opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all font-mono">→</span>
          </button>
        </div>

        {/* Right Col - Visual Tech */}
        <div className="flex-1 w-full flex flex-col gap-4 relative z-20">
           <div className="flex items-center gap-3 text-xs tracking-widest text-gray-500 uppercase font-medium mb-2 pl-2 border-l border-white/20">
              System Architecture
           </div>

           <div className="bg-black/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-5 hover:bg-white/[0.04] transition-colors">
              <div className="flex justify-between items-center mb-1">
                 <span className="text-sm font-medium text-gray-200">FAISS Indexing</span>
                 <span className="w-2 h-2 rounded-full bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              </div>
              <p className="text-xs text-gray-500">L2 Normalized Vector Space</p>
           </div>
           
           <div className="bg-black/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-5 hover:bg-white/[0.04] transition-colors translate-x-4">
              <div className="flex justify-between items-center mb-1">
                 <span className="text-sm font-medium text-gray-200">Hallucination Guardrail</span>
                 <span className="w-2 h-2 rounded-full bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></span>
              </div>
              <p className="text-xs text-gray-500">Cosine Similarity Threshold: 35%</p>
           </div>

           <div className="bg-black/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-5 hover:bg-white/[0.04] transition-colors max-w-[85%]">
              <div className="flex justify-between items-center mb-1">
                 <span className="text-sm font-medium text-gray-200">Citation Engine</span>
                 <span className="w-2 h-2 rounded-full bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              </div>
              <p className="text-xs text-gray-500">Exact sentence mapping & validation</p>
           </div>
        </div>

      </div>
    </div>
  );
}
