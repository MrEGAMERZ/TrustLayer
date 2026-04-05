import { useState, useRef, useEffect } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import DocumentUpload from "./DocumentUpload";
import toast from "react-hot-toast";

const SUGGESTIONS = [
  "What are the leave entitlements in the 2024 HR policy?",
  "Identify any conflicts between the uploaded documents.",
  "Summarize the Q4 financial obligations.",
  "Which clauses changed between Policy V1 and V2?",
];

export default function ChatWindow({ onNewSession }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const endRef     = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  const handleUploadSuccess = (filename) => {
    setMessages(prev => [
      ...prev,
      { role: "system", answer: `✅ Successfully ingested and vectorized: ${filename}. It is now ready for semantic query.`, is_hallucinated: false, confidence: null, citations: [] }
    ]);
  };

  const handleSend = async (overrideText = null) => {
    const query = overrideText || input;
    if (!query.trim()) return;
    if (!overrideText) setInput("");
    setCharCount(0);

    setMessages(prev => [...prev, { role: "user", text: query }]);
    setIsLoading(true);

    if (messages.length === 0 && onNewSession) onNewSession();

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const history = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.role === "user" ? m.text : m.answer }));

      const resp = await axios.post(`${API_URL}/query`, {
        question: query,
        history,
        strict_mode: strictMode,
      });

      if (resp.data.is_hallucinated) {
        toast('⚠️ Low confidence answer detected', {
          icon: '🔴',
          style: { background: '#1e0000', color: '#ffaaaa', border: '1px solid #ff000044' }
        });
      }
      setMessages(prev => [...prev, { role: "assistant", ...resp.data }]);
    } catch (err) {
      console.error(err);
      toast.error('Network Error — Could not reach TrustLayer API');
      setMessages(prev => [...prev, {
        role: "assistant",
        answer: "⚠️ The backend could not process this request. Please ensure the TrustLayer API is running on port 8000.",
        is_hallucinated: true,
        confidence: 0,
        citations: [],
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    setCharCount(e.target.value.length);
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent font-sans relative">

      {/* ── Header ── */}
      <div className="h-16 flex items-center px-6 border-b border-white/[0.06] glass flex-shrink-0 z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h2 className="text-[15px] font-light text-white tracking-wide whitespace-nowrap">Verification Console</h2>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-sm">Secure</span>
        </div>

        {/* Header right controls */}
        <div className="flex items-center gap-2">
          {/* Strict Mode toggle */}
          <button
            onClick={() => setStrictMode(s => !s)}
            title="Strict Mode: Refuse answers below 80% confidence"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider transition-all border ${
              strictMode
                ? 'bg-red-500/15 border-red-500/40 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'bg-white/[0.03] border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-white/15'
            }`}
          >
            <span>{strictMode ? '🔒' : '🔓'}</span>
            <span>{strictMode ? 'Strict' : 'Strict'}</span>
          </button>

          {/* Session actions */}
          <button className="w-8 h-8 rounded-lg glass border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-gray-200 transition-colors" title="Export Session">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
          <button className="w-8 h-8 rounded-lg glass border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-gray-200 transition-colors" title="Settings">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto py-6 px-4 md:px-6 space-y-1">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto animate-fade-in-scale pt-4">
            <div className="glass-liquid rounded-3xl p-8 w-full">
              <div className="w-14 h-14 mx-auto glass-strong rounded-2xl flex items-center justify-center mb-5 border border-white/10">
                <span className="text-2xl">🏛️</span>
              </div>
              <h2 className="text-xl text-white font-light tracking-tight mb-2">Enterprise Sandbox</h2>
              <p className="text-[13px] text-gray-500 font-light leading-relaxed mb-6">
                Upload a PDF document and ask any question. TrustLayer will verify every answer against your source material.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="text-left p-3 rounded-xl glass border border-white/[0.06] hover:border-white/15 transition-all text-[12px] text-gray-400 hover:text-gray-200 leading-snug"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>

            {/* Mini stats strip */}
            <div className="flex gap-6 text-center">
              {[['🔒', 'Zero hallucinations'], ['⚡', 'Sub-2s latency'], ['📄', 'Multi-PDF support']].map(([icon, label], i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{icon}</span>
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="max-w-3xl mx-auto w-full pb-36 space-y-4">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end animate-fade-in">
                <div className="glass-strong border border-white/15 text-gray-100 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[78%] shadow-lg">
                  <p className="text-[14px] font-light whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
              </div>
            ) : (
              <MessageBubble key={i} message={m} onFollowup={(t) => handleSend(t)} />
            )
          )}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="glass-liquid border border-white/8 text-cyan-400 rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl inline-flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite` }} />
                  ))}
                </div>
                <span className="text-[13px] font-light tracking-wide">Synthesizing vector paths...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="absolute bottom-0 w-full pointer-events-none z-20">
        <div className="bg-gradient-to-t from-[#080b14] via-[#080b14]/90 to-transparent pt-8 pb-5 px-4">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="glass-liquid border border-white/10 rounded-2xl overflow-hidden focus-within:border-white/20 transition-all shadow-2xl">
              {/* Strict mode indicator strip */}
              {strictMode && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/8 border-b border-red-500/15">
                  <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest">🔒 Strict Mode Active — answers below 80% confidence will be refused</span>
                </div>
              )}
              <div className="flex items-end gap-2 p-2 pl-3">
                <DocumentUpload onUploadSuccess={handleUploadSuccess} />
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Query your enterprise documents..."
                  className="flex-1 resize-none bg-transparent py-3 pr-2 text-[14px] text-gray-200 font-light placeholder-gray-600 focus:outline-none min-h-[48px] max-h-[180px] leading-relaxed"
                  rows="1"
                />
                <div className="flex flex-col items-end gap-1 pb-1 flex-shrink-0">
                  {charCount > 0 && (
                    <span className="text-[9px] text-gray-600 font-mono">{charCount}</span>
                  )}
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 text-white hover:bg-white/15 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-white/8 hover:border-white/20 flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-700 mt-2 font-light">
              TrustLayer may produce inaccurate information. Grounding constraints are enforced. · <span className="text-gray-600">⇧ Enter for new line</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
