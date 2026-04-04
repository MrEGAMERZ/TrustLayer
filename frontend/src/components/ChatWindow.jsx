import { useState, useRef, useEffect } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import DocumentUpload from "./DocumentUpload";
import toast from "react-hot-toast";

export default function ChatWindow({ onNewSession }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUploadSuccess = (filename) => {
    setMessages((prev) => [
       ...prev, 
      { role: "system", answer: `✅ Successfully ingested and vectorized: ${filename}. It is now ready for semantic query.`, is_hallucinated: false, confidence: null, citations: [] }
    ]);
  };

  const handleSend = async (overrideText = null) => {
    const query = overrideText || input;
    if (!query.trim()) return;

    if (!overrideText) setInput("");

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setIsLoading(true);

    // If this is the first message being sent, trigger a new session creation in the outer state
    if (messages.length === 0 && onNewSession) {
      onNewSession();
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      const history = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({
          role: m.role,
          content: m.role === "user" ? m.text : m.answer
        }));

      const resp = await axios.post(`${API_URL}/query`, {
        question: query,
        history: history
      });

      if (resp.data.is_hallucinated) {
        toast('⚠️ Low confidence answer detected', { icon: '🔴', style: { background: '#1e0000', color: '#ffaaaa', border: '1px solid #ff000044' } });
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", ...resp.data }
      ]);
    } catch (err) {
      console.error(err);
      toast.error('Network Error: Could not reach TrustLayer API');
      setMessages((prev) => [
        ...prev,
        { role: "assistant", answer: "Error: The backend could not process this request.", is_hallucinated: true, confidence: 0, citations: [] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent font-sans relative">
      
      {/* ── Header Area (Minimal) ── */}
      <div className="h-[72px] flex items-center px-8 border-b border-white/5 bg-black/10 backdrop-blur-md flex-shrink-0">
        <h2 className="text-xl font-light text-white flex items-center gap-3">
          Verification Console
          <span className="text-[10px] uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-sm">Secure</span>
        </h2>
      </div>

      {/* ── Messages Box ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 max-w-lg mx-auto animate-fade-in">
            <div className="glass p-8 rounded-3xl text-center shadow-[0_0_40px_rgba(255,255,255,0.02)]">
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10">
                <span className="text-3xl opacity-80">🏛️</span>
              </div>
              <h2 className="text-2xl text-white font-light tracking-tight mb-3">Enterprise Sandbox</h2>
              <p className="text-sm font-light text-gray-400 leading-relaxed">
                Initialize the matrix by dropping an enterprise document (PDF) into the widget below, and input any contextual query.
              </p>
            </div>
            
            {/* Context Hints */}
            <div className="flex gap-2 w-full mt-4">
              <button onClick={() => handleSend("What is the Q4 budget?")} className="flex-1 text-left p-3 rounded-xl glass border-white/5 hover:border-white/20 transition-all text-xs text-gray-300">
                <span className="opacity-50">"What is the Q4 budget?"</span>
              </button>
              <button onClick={() => handleSend("Identify any conflicts in the policies.")} className="flex-1 text-left p-3 rounded-xl glass border-white/5 hover:border-white/20 transition-all text-xs text-gray-300">
                <span className="opacity-50">"Identify any conflicts..."</span>
              </button>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full pb-20">
          {messages.map((m, i) => (
             m.role === "user" ? (
               <div key={i} className="flex justify-end mb-4 animate-fade-in">
                  <div className="bg-white/10 backdrop-blur-2xl border border-white/20 text-gray-200 rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                    <p className="whitespace-pre-wrap font-light">{m.text}</p>
                  </div>
               </div>
             ) : (
               <MessageBubble key={i} message={m} onFollowup={(text) => handleSend(text)} />
             )
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="glass-strong text-cyan-400 rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl inline-flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse"></span>
                <span className="text-sm font-medium tracking-wide">Synthesizing vector paths...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#06080f] py-6 px-4 pointer-events-none">
        
        <div className="max-w-4xl mx-auto relative flex items-end shadow-2xl rounded-3xl glass-strong border border-white/10 focus-within:border-white/30 transition-all p-1.5 pt-0 pointer-events-auto">
          
          <div className="flex flex-col justify-end pb-0.5">
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Query enterprise context or drag a PDF here..."
              className="w-full resize-none bg-transparent p-4 pr-16 text-gray-200 font-light placeholder-gray-500 focus:outline-none min-h-[56px] max-h-48 pt-5"
              rows="1"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-white/5 text-white rounded-2xl hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-transparent hover:border-white/20 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="text-center mt-3 max-w-4xl mx-auto pointer-events-auto">
          <p className="text-[10px] text-gray-500 font-light">TrustLayer Copilot may produce inaccurate information about people, places, or facts. Grounding constraints are enforced.</p>
        </div>
      </div>
    </div>
  );
}
