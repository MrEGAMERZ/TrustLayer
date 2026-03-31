import { useState } from 'react';
import ChatWindow from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";
import LandingPage from "./components/LandingPage";
import { Toaster } from "react-hot-toast";

function App() {
  const [appMounted, setAppMounted] = useState(false);

  return (
    <>
      <Toaster position="top-right" />
      {!appMounted ? (
        <LandingPage onEnter={() => setAppMounted(true)} />
      ) : (
        <div className="flex h-screen w-full font-sans bg-gray-50 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
             <ChatWindow />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
