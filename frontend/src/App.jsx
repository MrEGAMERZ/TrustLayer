import { useState, useCallback } from 'react';
import ChatWindow from "./components/ChatWindow";
import RightSidebar from "./components/RightSidebar";
import LandingPage from "./components/LandingPage";
import { Toaster } from "react-hot-toast";

const INITIAL_SESSIONS = [
  { id: 1, title: "Policy V1 vs V2 Conflict Analysis", time: "2h ago",    active: true,  icon: "⚡" },
  { id: 2, title: "Q4 Budget reconciliation",           time: "5h ago",    active: false, icon: "📊" },
  { id: 3, title: "HR Handbook – leave entitlements",   time: "Yesterday", active: false, icon: "📋" },
  { id: 4, title: "SEC 10-K Apple 2023 deep-dive",      time: "2d ago",    active: false, icon: "🏦" },
  { id: 5, title: "Tesla vs Microsoft strategy gap",    time: "3d ago",    active: false, icon: "🔍" },
];

function App() {
  const [view, setView]        = useState('landing');
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [activeId, setActiveId] = useState(1);

  const newSession = useCallback(() => {
    const id = Date.now();
    setSessions(prev => [
      { id, title: "New session", time: "Just now", active: true, icon: "✨" },
      ...prev.map(s => ({ ...s, active: false })),
    ]);
    setActiveId(id);
  }, []);

  const selectSession = useCallback((id) => {
    setActiveId(id);
    setSessions(prev => prev.map(s => ({ ...s, active: s.id === id })));
  }, []);

  return (
    <div className="h-screen w-screen bg-[#080b14] text-gray-200 font-sans relative overflow-hidden flex flex-col">

      {/* ── Background Orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-8%]  w-[52vw] h-[52vw] rounded-full bg-cyan-500/[0.04]   blur-[130px] animate-orb-float" />
        <div className="absolute bottom-[-20%] right-[-8%] w-[48vw] h-[48vw] rounded-full bg-indigo-500/[0.05] blur-[140px] animate-orb-float" style={{ animationDelay: '-6s' }} />
        <div className="absolute top-[45%] left-[42%] w-[28vw] h-[28vw] rounded-full bg-violet-500/[0.03] blur-[110px] animate-orb-float" style={{ animationDelay: '-10s' }} />
        {/* Subtle noise grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(13,17,32,0.92)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0',
            fontSize: '13px',
            borderRadius: '12px',
            padding: '10px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
        }}
      />

      {view === 'landing' && (
        <LandingPage onEnter={() => setView('chat')} />
      )}

      {view === 'chat' && (
        <div className="relative z-10 flex h-full w-full overflow-hidden">
          {/* Main chat */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <ChatWindow onNewSession={newSession} />
          </div>
          {/* Right sidebar */}
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
