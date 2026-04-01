import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar({ onLogoClick }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Poll for new documents every 5 seconds
    const fetchDocs = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const resp = await axios.get(`${API_URL}/documents`);
        setDocuments(resp.data.documents || []);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocs();
    const int = setInterval(fetchDocs, 5000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="w-1/4 min-w-[300px] h-screen bg-black/40 backdrop-blur-3xl border-r border-white/10 flex flex-col pt-4 relative z-20">
      
      <div className="px-5 mb-4 border-b border-white/10 pb-4 flex justify-between items-center group cursor-pointer" onClick={onLogoClick}>
        <div>
           <h3 className="text-gray-200 font-bold flex items-center gap-2 group-hover:text-white transition-colors">
             <span className="opacity-80">🛡️</span> Enterprise Vault
           </h3>
           <p className="text-xs text-gray-500 mt-1">Foundational vectors currently active.</p>
        </div>
        <span className="text-xl opacity-20 group-hover:opacity-100 transition-opacity">→</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 gap-3 flex flex-col space-y-3 pb-8">
        {loading && <div className="text-xs text-gray-500 text-center py-5 animate-pulse">Scanning remote index...</div>}
        
        {!loading && documents.length === 0 && (
          <div className="border border-dashed border-white/20 bg-white/5 rounded-2xl p-5 text-center flex flex-col items-center">
            <span className="text-xl mb-2 opacity-50">📄</span>
            <span className="text-sm font-semibold text-gray-400">No context loaded</span>
            <p className="text-xs text-gray-600 mt-1">Upload an internal document using the top-bar to train the active matrix.</p>
          </div>
        )}

        {!loading && documents.map((doc, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:bg-white/10 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50 rounded-l shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
            
            <div className="flex items-start justify-between">
               <h4 className="text-sm font-medium text-gray-200 break-words w-4/5 line-clamp-2">{doc.name}</h4>
            </div>
            
            <div className="flex gap-2 mt-3 items-center">
               <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1">
                 ✅ {doc.chunks} semantic nodes
               </span>
            </div>

            <div className="mt-3 text-[11px] text-gray-600 flex justify-between items-center border-t border-white/10 pt-2">
               <span>Available to LLM</span>
               <span className="text-cyan-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(6,182,212,0.8)] px-1 rounded">Active Context</span>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
