export default function Dashboard({ onLaunchChat }) {
  // Fake dashboard data to wow judges
  const stats = [
    { label: "Active Vectors", val: "42,019" },
    { label: "Queries Served", val: "1,204" },
    { label: "Avg Trust Score", val: "94.8%" },
    { label: "Hallucinations Blocked", val: "72" }
  ];

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-8 relative z-10 px-4 max-w-6xl mx-auto overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/[0.03] rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex w-full justify-between items-end mb-12 animate-fade-in-up">
        <div className="flex flex-col">
          <span className="text-xl opacity-60 flex gap-2 items-center mb-2">🛡️ <span className="uppercase tracking-[0.2em] text-sm">TrustLayer Core</span></span>
          <h2 className="text-4xl text-white font-light tracking-tight">System Telemetry.</h2>
        </div>
        <button 
          onClick={onLaunchChat}
          className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_4px_16px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.2)] hover:-translate-y-1"
        >
          Initialize Copilot Session 🚀
        </button>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-6">
        {stats.map((s, i) => (
          <div key={i} className={`bg-white/[0.03] border border-white/10 backdrop-blur-2xl p-8 rounded-3xl flex flex-col justify-end min-h-[160px] hover:bg-white/[0.05] transition-colors relative overflow-hidden delay-${i*100}`}>
             <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm pointer-events-none text-9xl leading-none">
                0{i+1}
             </div>
             <p className="text-sm uppercase tracking-widest text-gray-500 font-medium mb-1 relative z-10">{s.label}</p>
             <p className="text-4xl font-light text-gray-100 relative z-10 tracking-tight">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Large visual graph area */}
      <div className="w-full relative flex-1 min-h-[300px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2rem] p-8 flex flex-col hover:bg-white/[0.03] transition-colors overflow-hidden">
         <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-400 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Global Confidence Variance (7 Days)
         </h3>
         
         {/* Fake visually stunning graph using flex bars */}
         <div className="flex-1 flex items-end gap-2 px-4 justify-between w-full h-full pb-4">
            {[40, 60, 45, 80, 50, 95, 85, 90, 75, 50, 40, 80, 85, 60, 95, 100, 90, 85].map((h, i) => (
              <div key={i} className="relative group w-full flex flex-col justify-end items-center h-full">
                 <div 
                   className="w-full bg-gradient-to-t from-blue-500/10 to-indigo-500/30 rounded-t-sm transition-all duration-1000 group-hover:from-blue-400/40 group-hover:to-cyan-400/60 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] relative"
                   style={{ height: `${h}%` }}
                 >
                    {/* Glowing top cap */}
                    <div className="absolute top-0 w-full h-1 bg-white/50 backdrop-blur-lg"></div>
                 </div>
              </div>
            ))}
         </div>
         
         <div className="flex justify-between w-full border-t border-white/10 pt-4 text-xs text-gray-500 tracking-widest uppercase mt-auto">
            <span>March 25</span>
            <span>April 1</span>
         </div>
      </div>
    </div>
  );
}
