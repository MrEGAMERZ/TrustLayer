import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function RightSidebar({ sessions, activeId, onSelectSession, onNewSession }) {
  const [model, setModel] = useState("Sentinel Alpha-1 (High Speed)");
  
  return (
    <div className="w-[340px] h-full flex flex-col border-l border-white/10 glass shadow-2xl relative z-20 flex-shrink-0 transition-transform duration-300">
      
      {/* ── Top Bar (Icons / Profile) ── */}
      <div className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 rounded-xl glass-strong flex items-center justify-center text-sm shadow-[0_4px_12px_rgba(6,182,212,0.1)]">
            <span>🛡️</span>
          </div>
          <span className="text-xl font-light tracking-wide text-white ml-2">TrustLayer</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Dummy Notifications */}
          <button className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors relative">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
          </button>
          
          {/* Dummy Profile */}
          <button className="w-8 h-8 rounded-full glass border focus:border-cyan-500 overflow-hidden ml-1">
            <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
              JD
            </div>
          </button>
        </div>
      </div>

      {/* ── Settings / Environment ── */}
      <div className="p-5 border-b border-white/5 flex-shrink-0">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 ml-1">Environment</h3>
        
        <div className="glass-strong rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 blur-2xl rounded-full group-hover:bg-cyan-400/10 transition-all"></div>
          
          <label className="text-xs text-gray-400">Processing Engine</label>
          <select 
            className="bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors w-full cursor-pointer appearance-none"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option>Sentinel Alpha-1 (High Speed)</option>
            <option>Llama 3.3 70B (Versatile)</option>
            <option>Deep Seek R1 (Reasoning)</option>
          </select>
          
          <div className="flex items-center justify-between mt-1 text-xs px-1">
            <span className="text-gray-500">Cross-validation</span>
            <span className="text-cyan-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Active
            </span>
          </div>
        </div>
      </div>

      {/* ── Chat Sessions list ── */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-1 min-h-0">
        <div className="flex items-center justify-between mb-3 px-1 hover:cursor-default">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">History</h3>
          <button className="text-gray-400 hover:text-white p-1 rounded-md transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>

        {sessions.map(s => (
          <button 
            key={s.id} 
            onClick={() => onSelectSession(s.id)}
            className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all duration-200
              ${s.active 
                ? 'bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.03)]' 
                : 'border border-transparent hover:bg-white/[0.04] text-gray-400 hover:text-gray-200'}`}
          >
            <span className="mt-0.5 text-sm opacity-80">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.title}</p>
              <p className="text-[10px] text-gray-500 mt-1">{s.time}</p>
            </div>
            {s.active && (
              <div className="w-1 h-8 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            )}
          </button>
        ))}
      </div>

      {/* ── Bottom Action ── */}
      <div className="p-5 border-t border-white/5 flex-shrink-0 bg-transparent">
        <button 
          onClick={onNewSession}
          className="w-full py-3 rounded-xl glass-strong border-cyan-500/30 hover:border-cyan-400/60 hover:bg-white/10 text-cyan-50 text-sm font-medium transition-all shadow-[0_4px_16px_rgba(6,182,212,0.1)] flex items-center justify-center gap-2 group"
        >
          <svg className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Analysis
        </button>
      </div>
      
    </div>
  );
}
