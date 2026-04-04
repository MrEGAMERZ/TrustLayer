export default function LandingPage({ onEnter }) {
  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden z-10 text-white font-sans">
      
      <div className="max-w-xl w-full mx-auto px-6 text-center animate-fade-in z-10">
        
        {/* Sleek icon / Badge */}
        <div className="inline-flex items-center gap-3 glass px-5 py-2.5 rounded-full border border-white/10 mb-8 mx-auto hover:bg-white/5 transition-colors cursor-default shadow-[0_0_30px_rgba(255,255,255,0.02)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ring-4 ring-cyan-500/20"></span>
          <span className="text-xs uppercase tracking-[0.15em] text-cyan-50 font-medium">Enterprise AI Core</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-light tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500">
          Intelligence, <br/><span className="font-semibold text-white">Verified.</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl font-light max-w-lg mx-auto mb-10 leading-relaxed">
          The only LLM framework with guaranteed hallucination-guards and multi-document cross-validation.
        </p>

        <button 
          onClick={onEnter}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium text-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]"
        >
          <span className="relative z-10 tracking-wide">Initialize Workspace</span>
          <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
        
        <div className="mt-20 flex gap-6 justify-center text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
          <span>SOC2 Type II</span>
          <span>•</span>
          <span>Sentinel V2</span>
          <span>•</span>
          <span>End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
}
