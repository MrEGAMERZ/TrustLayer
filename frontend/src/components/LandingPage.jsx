export default function LandingPage({ onEnter }) {
  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-600/10 to-purple-600/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-full h-96 bg-gradient-to-tl from-indigo-600/10 to-blue-400/10 blur-3xl rounded-full translate-x-1/2 translate-y-1/2"></div>
      
      <div className="z-10 max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center bg-white/60 backdrop-blur-md border border-white p-8 md:p-12 rounded-3xl shadow-xl">
        
        {/* Left Col - Pitch */}
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl">🛡️</span>
            <span className="text-xl font-bold tracking-tight text-gray-900">TrustLayer <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2 font-semibold">v1.0.0-beta</span></span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Enterprise Knowledge.<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Verified.</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            The only enterprise AI copilot that mathematically proves every answer it gives. Upload your sensitive policies, contracts, and manuals, and get answers grounded in exact-sentence citation.
          </p>
          
          <button 
            onClick={onEnter}
            className="group flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Authenticate & Access Matrix <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          
          <div className="mt-8 pt-6 border-t border-gray-200 w-full">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Trusted Architecture Stack</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-500 font-semibold items-center">
               <span>FastAPI</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span>React</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span>FAISS Vectors</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span>Gemini Flash</span>
            </div>
          </div>
        </div>

        {/* Right Col - Visual Tech */}
        <div className="relative hidden md:flex justify-center items-center h-full">
           <div className="bg-white border rounded-2xl shadow-sm p-5 w-full max-w-sm flex flex-col gap-3 rotate-2 hover:rotate-0 transition-all duration-500">
             <div className="flex justify-between items-center mb-2">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <span className="text-xs text-gray-400 font-mono">system.diagnostic</span>
             </div>
             <div className="h-4 bg-gray-100 rounded w-3/4"></div>
             <div className="h-4 bg-gray-100 rounded w-full"></div>
             <div className="h-4 bg-gray-100 rounded w-5/6 mb-3"></div>
             <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs font-semibold text-green-700">Cosine Confidence</span>
                <span className="text-xs font-bold text-green-800">94.2%</span>
             </div>
             <div className="bg-gray-50 border p-3 rounded-lg flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Citation Triggered</span>
                <span className="text-xs text-gray-700 italic border-l-2 border-blue-400 pl-2">"Found in HR_Policy_v4.pdf pg 12"</span>
             </div>
           </div>
        </div>

      </div>

      <div className="absolute bottom-6 text-center text-xs text-gray-400">
        © 2026 TrustLayer by Team InclusionX · Built for Mini SIH 2026
      </div>
    </div>
  );
}
