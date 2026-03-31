import { useState } from 'react';
import ChatWindow from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import { Toaster } from "react-hot-toast";

function App() {
  // 'landing' | 'dashboard' | 'chat'
  const [currentView, setCurrentView] = useState('landing');

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative overflow-hidden selection:bg-white/20">
      {/* Global Liquid Glass Decorators */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none"></div>
      
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          }
        }} 
      />

      {currentView === 'landing' && <LandingPage onEnter={() => setCurrentView('dashboard')} />}
      
      {currentView === 'dashboard' && <Dashboard onLaunchChat={() => setCurrentView('chat')} />}

      {currentView === 'chat' && (
        <div className="flex h-screen w-full relative z-10">
          <Sidebar onLogoClick={() => setCurrentView('dashboard')} />
          <div className="flex-1 flex flex-col h-full bg-transparent relative border-l border-white/5">
             <ChatWindow />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
