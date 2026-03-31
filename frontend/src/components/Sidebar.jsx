import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar() {
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
    <div className="w-1/4 min-w-[300px] h-screen bg-gray-50 border-r border-gray-200 flex flex-col pt-4">
      
      <div className="px-5 mb-4 border-b border-gray-200 pb-4">
        <h3 className="text-gray-900 font-bold flex items-center gap-2">
          <span>🗂️</span> Enterprise Library
        </h3>
        <p className="text-xs text-gray-500 mt-1">Foundational vectors currently active in the TrustLayer database.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 gap-3 flex flex-col space-y-3 pb-8">
        {loading && <div className="text-xs text-gray-400 text-center py-5">Scanning remote index...</div>}
        
        {!loading && documents.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-lg p-5 text-center flex flex-col items-center">
            <span className="text-xl mb-2 text-gray-300">📄</span>
            <span className="text-sm font-semibold text-gray-600">No context loaded</span>
            <p className="text-xs text-gray-400 mt-1">Upload an internal document using the top-bar to train the active matrix.</p>
          </div>
        )}

        {!loading && documents.map((doc, idx) => (
          <div key={idx} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l"></div>
            
            <div className="flex items-start justify-between">
               <h4 className="text-sm font-bold text-gray-800 break-words w-4/5 line-clamp-2">{doc.name}</h4>
            </div>
            
            <div className="flex gap-2 mt-3 items-center">
               <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                 ✅ {doc.chunks} semantic nodes
               </span>
            </div>

            <div className="mt-3 text-[11px] text-gray-400 flex justify-between items-center border-t border-gray-50 pt-2">
               <span>Available to LLM</span>
               <span className="text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Active Context</span>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
