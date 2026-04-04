import { useState, useCallback } from 'react';
import ChatWindow from "./components/ChatWindow";
import RightSidebar from "./components/RightSidebar";
import LandingPage from "./components/LandingPage";
import { Toaster } from "react-hot-toast";

// ── Dummy Session Data ────────────────────────────────
const INITIAL_SESSIONS = [
  { id: 1, title: "Policy V1 vs V2 Conflict Analysis", time: "2h ago", active: true,  icon: "⚡" },
  { id: 2, title: "Q4 Budget reconciliation",           time: "5h ago", active: false, icon: "📊" },
  { id: 3, title: "HR Handbook – leave entitlements",   time: "Yesterday", active: false, icon: "📋" },
  { id: 4, title: "SEC 10-K Apple 2023 deep-dive",      time: "2d ago",  active: false, icon: "🏦" },
  { id: 5, title: "Tesla vs Microsoft strategy gap",    time: "3d ago",  active: false, icon: "🔍" },
];

function App() {
  const [view, setView]         = useState('landing');   // 'landing' | 'chat'
  const [sessions, setSessions]  = useState(INITIAL_SESSIONS);
  const [activeId, setActiveId]  = useState(1);

  const newSession = useCallback(() => {
    const id = Date.now();
    const next = {
      id,
      title: "New session",
      time: "Just now",
      active: true,
      icon: "✨"
    };
    setSessions(prev => [next, ...prev.map(s => ({ ...s, active: false }))]);
    setActiveId(id);
  }, []);

  const selectSession = useCallback((id) => {
    setActiveId(id);
    setSessions(prev => prev.map(s => ({ ...s, active: s.id === id })));
  }, []);

  return (
    <div className="h-screen w-screen bg-[#06080f] text-gray-200 font-sans relative overflow-hidden flex flex-col">

      {/* ── Background Orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-cyan-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[130px]" />
        <div className="absolute top-[40%] left-[40%] w-[25vw] h-[25vw] rounded-full bg-violet-900/5 blur-[100px]" />
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(15,20,40,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e2e8f0',
            fontSize: '13px',
            borderRadius: '12px',
            padding: '10px 16px',
          }
        }}
      />

      {view === 'landing' && (
        <LandingPage onEnter={() => setView('chat')} />
      )}

      {view === 'chat' && (
        <div className="relative z-10 flex h-full w-full overflow-hidden">
          {/* ── MAIN CHAT (left) ── */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <ChatWindow onNewSession={newSession} />
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <RightSidebar
            sessions={sessions}
            activeId={activeId}
            onSelectSession={selectSession}
            onNewSession={newSession}
          />
        </div>
      )}
    </div>
  );
}

export default App;
