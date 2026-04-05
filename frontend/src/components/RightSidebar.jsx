import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// DOCS removed, fetched via API

const ACTIVITY = [
  { label: "Hallucinations blocked", value: 0,   color: "#4ade80" },
  { label: "Conflicts detected",      value: 3,   color: "#fb923c" },
  { label: "Queries processed",       value: 18,  color: "#22d3ee" },
  { label: "Avg confidence",          value: "87%", color: "#a78bfa", raw: true },
];

function UsageMeter({ used = 67 }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-gray-500 uppercase tracking-wider font-medium">Context Window</span>
        <span className="text-gray-400 font-mono">{used}%</span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${used}%`,
            background: used > 80
              ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
              : 'linear-gradient(90deg, #22d3ee, #818cf8)',
            boxShadow: `0 0 8px ${used > 80 ? 'rgba(239,68,68,0.4)' : 'rgba(34,211,238,0.3)'}`,
          }}
        />
      </div>
    </div>
  );
}

function SystemDot({ active = true }) {
  return (
    <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
      {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />}
      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
    </span>
  );
}

export default function RightSidebar({ sessions, activeId, onSelectSession, onNewSession }) {
  const [model, setModel]         = useState("Sentinel Alpha-1 (High Speed)");
  const [activeTab, setActiveTab] = useState("sessions"); // sessions | docs | stats
  const [collapsed, setCollapsed] = useState(false);
  const [uptime, setUptime]       = useState(0);
  const [docs, setDocs]           = useState([]);

  // Fake uptime ticker
  useEffect(() => {
    const t = setInterval(() => setUptime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch documents periodically
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const resp = await axios.get(`${API_URL}/documents`);
        setDocs(resp.data.documents || []);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      }
    };
    
    fetchDocs();
    const int = setInterval(fetchDocs, 3000);
    return () => clearInterval(int);
  }, []);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const handleClearDocs = () => {
    toast('No documents cleared — dummy action', { icon: '🗑️' });
  };

  return (
    <div
      className={`h-full flex flex-col border-l border-white/[0.06] glass shadow-2xl relative z-20 flex-shrink-0 transition-all duration-300 ${
        collapsed ? 'w-14' : 'w-[300px]'
      }`}
    >
      {/* ── Top Bar ── */}
      <div className="h-16 px-4 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg glass-strong flex items-center justify-center text-sm shadow-[0_0_16px_rgba(34,211,238,0.12)] flex-shrink-0">
              🛡️
            </div>
            <span className="text-[15px] font-light tracking-wide text-white truncate">TrustLayer</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          {!collapsed && (
            <>
              {/* Notification badge */}
              <button className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-500 transition-colors relative">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_6px_rgba(248,113,113,0.9)]" />
              </button>
              {/* Avatar */}
              <button className="w-7 h-7 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white">
                  JD
                </div>
              </button>
            </>
          )}
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {collapsed && (
        <div className="flex flex-col items-center gap-3 pt-4">
          {['💬','📁','📊'].map((icon, i) => (
            <button key={i} className="w-8 h-8 rounded-lg glass border border-white/[0.06] flex items-center justify-center text-sm hover:bg-white/8 transition-colors">
              {icon}
            </button>
          ))}
        </div>
      )}

      {!collapsed && (
        <>
          {/* ── System Health ── */}
          <div className="px-4 py-3 border-b border-white/[0.05] flex-shrink-0">
            <div className="glass-liquid rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">System Status</span>
                <span className="text-[9px] font-mono text-gray-600">{formatUptime(uptime)}</span>
              </div>
              {[
                { label: 'Vector Store',   ok: true },
                { label: 'Sentinel Guard', ok: true },
                { label: 'Gemini API',     ok: true },
                { label: 'Strict Mode',    ok: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-light">{s.label}</span>
                  <div className="flex items-center gap-1.5">
                    <SystemDot active={s.ok} />
                    <span className={`text-[9px] font-mono ${s.ok ? 'text-emerald-400' : 'text-gray-600'}`}>{s.ok ? 'ONLINE' : 'OFF'}</span>
                  </div>
                </div>
              ))}
              <UsageMeter used={67} />
            </div>
          </div>

          {/* ── Engine Selector ── */}
          <div className="px-4 py-3 border-b border-white/[0.05] flex-shrink-0">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium block">Processing Engine</label>
              <div className="relative">
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-gray-200 focus:outline-none focus:border-cyan-500/40 transition-colors appearance-none cursor-pointer"
                >
                  <option>Sentinel Alpha-1 (High Speed)</option>
                  <option>Llama 3.3 70B (Versatile)</option>
                  <option>DeepSeek R1 (Reasoning)</option>
                  <option>Gemini 2.0 Flash (Balanced)</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="flex items-center gap-1.5 px-0.5">
                <SystemDot active />
                <span className="text-[10px] text-gray-500 font-light">Cross-validation active</span>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-white/[0.05] flex-shrink-0">
            {[
              { id: 'sessions', label: 'History', icon: '💬' },
              { id: 'docs',     label: 'Vault',   icon: '📁' },
              { id: 'stats',    label: 'Stats',   icon: '📊' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px bg-cyan-500/5'
                    : 'text-gray-600 hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <div className="flex-1 overflow-y-auto min-h-0">

            {/* SESSIONS TAB */}
            {activeTab === 'sessions' && (
              <div className="p-3 space-y-1">
                {sessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSession(s.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2.5 transition-all duration-200 group ${
                      s.active
                        ? 'bg-white/8 border border-white/15'
                        : 'border border-transparent hover:bg-white/[0.03] text-gray-500 hover:text-gray-200'
                    }`}
                  >
                    <span className="text-sm mt-0.5 flex-shrink-0">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-medium truncate ${s.active ? 'text-white' : ''}`}>{s.title}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{s.time}</p>
                    </div>
                    {s.active && (
                      <div className="w-[2px] h-6 bg-cyan-400 rounded-full self-center flex-shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* DOCS TAB */}
            {activeTab === 'docs' && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Document Vault</span>
                  <button onClick={handleClearDocs} className="text-[9px] text-red-500/60 hover:text-red-400 transition-colors font-mono uppercase tracking-wider">Clear all</button>
                </div>
                {docs.map((doc, i) => (
                  <div key={i} className="glass-liquid rounded-xl p-3 space-y-2 hover:border-white/10 transition-all">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-xs">📄</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-300 font-medium truncate">{doc.name}</p>
                        <p className="text-[10px] text-gray-600 font-mono mt-0.5">· {doc.chunks} chunks</p>
                      </div>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">✓ OK</span>
                    </div>
                    {doc.year && (
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[9px] text-amber-400/60 font-mono">📅 Year: {doc.year}</span>
                        <span className="text-[9px] text-gray-700">·</span>
                        <span className="text-[9px] text-gray-600 font-mono">FAISS indexed</span>
                      </div>
                    )}
                  </div>
                ))}
                <div className="glass rounded-xl p-3 border-dashed border border-white/[0.06] flex items-center justify-center gap-2 hover:border-cyan-500/20 transition-colors cursor-pointer">
                  <span className="text-gray-600 text-xs">+</span>
                  <span className="text-[11px] text-gray-600 font-light">Drop PDF to ingest</span>
                </div>
              </div>
            )}

            {/* STATS TAB */}
            {activeTab === 'stats' && (
              <div className="p-3 space-y-3">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider px-1 mb-1">Session Analytics</div>
                {ACTIVITY.map((item, i) => (
                  <div key={i} className="glass-liquid rounded-xl px-3 py-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-light">{item.label}</span>
                    <span className="text-[15px] font-light tabular-nums" style={{ color: item.color }}>
                      {item.value}
                    </span>
                  </div>
                ))}

                {/* Mini bar chart */}
                <div className="glass-liquid rounded-xl p-3 space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Query Volume (7d)</span>
                  <div className="flex items-end gap-1 h-12 mt-2">
                    {[3, 7, 2, 12, 8, 18, 5].map((v, i) => (
                      <div key={i} className="flex-1 rounded-sm transition-all" style={{
                        height: `${(v / 18) * 100}%`,
                        background: i === 5 ? '#22d3ee' : 'rgba(255,255,255,0.08)',
                        boxShadow: i === 5 ? '0 0 8px rgba(34,211,238,0.4)' : 'none',
                      }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-700 font-mono">
                    {['M','T','W','T','F','S','S'].map((d,i) => <span key={i}>{d}</span>)}
                  </div>
                </div>

                <div className="glass-liquid rounded-xl p-3 space-y-1.5">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Trust Distribution</span>
                  {[
                    { label: 'High (≥80%)',   pct: 72, color: '#4ade80' },
                    { label: 'Medium (40–79%)', pct: 21, color: '#fb923c' },
                    { label: 'Low (<40%)',    pct: 7,  color: '#ef4444' },
                  ].map((r, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500">{r.label}</span>
                        <span className="font-mono" style={{ color: r.color }}>{r.pct}%</span>
                      </div>
                      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color, opacity: 0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── New Analysis ── */}
          <div className="p-3 border-t border-white/[0.05] flex-shrink-0">
            <button
              onClick={onNewSession}
              className="w-full py-2.5 rounded-xl glass-strong border border-cyan-500/20 hover:border-cyan-400/40 hover:bg-white/8 text-cyan-100 text-[12px] font-medium transition-all flex items-center justify-center gap-2 group"
            >
              <svg className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Analysis
            </button>
          </div>
        </>
      )}
    </div>
  );
}
