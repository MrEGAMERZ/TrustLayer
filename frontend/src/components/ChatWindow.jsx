import { useState, useRef, useEffect } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import DocumentUpload from "./DocumentUpload";

export default function ChatWindow() {
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const query = input;
    setInput("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const resp = await axios.post(`${API_URL}/query`, {
        question: query
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", ...resp.data }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", answer: "Error: The backend could not process this request.", is_hallucinated: false, confidence: null, citations: [] }
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
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <DocumentUpload onUploadSuccess={handleUploadSuccess} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-sm text-center">
              <span className="text-4xl block mb-4">🏛️</span>
              <h2 className="text-xl text-gray-800 font-semibold mb-2">Welcome to TrustLayer</h2>
              <p className="text-sm">Please upload an enterprise document (PDF) at the top, and ask any contextual question below.</p>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full pb-20">
          {messages.map((m, i) => (
             m.role === "user" ? (
               <div key={i} className="flex justify-end mb-4">
                  <div className="bg-[#0f172a] text-white rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-md">
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
               </div>
             ) : (
               <MessageBubble key={i} message={m} />
             )
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border text-gray-500 rounded-xl rounded-tl-sm px-4 py-3 shadow-sm inline-flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-75"></span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-150"></span>
                <span className="text-sm font-medium">Analyzing vector chunks...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto relative flex items-end shadow-lg rounded-2xl bg-white border outline-2 outline-transparent focus-within:outline-blue-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your trusted enterprise context..."
            className="w-full resize-none bg-transparent p-4 pr-16 text-gray-800 focus:outline-none min-h-[56px] max-h-48 overflow-y-auto"
            rows="1"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
