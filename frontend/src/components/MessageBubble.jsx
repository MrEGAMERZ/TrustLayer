import { useState } from "react";
import CitationCard from "./CitationCard";
import ReasoningPanel from "./ReasoningPanel";
import MultiDocConflict from "./MultiDocConflict";
import HallucinationBadge, { OutdatedWarningBadge } from "./HallucinationBadge";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

export default function MessageBubble({ message, onFollowup }) {
  const [showCitations, setShowCitations] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // User Bubble
  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-gray-200 rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <p className="whitespace-pre-wrap font-light">{message.text}</p>
        </div>
      </div>
    );
  }

  // System Event Bubble
  if (message.role === "system") {
    return (
      <div className="flex justify-center mb-6">
        <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 backdrop-blur-md rounded-xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] w-full max-w-2xl text-center font-medium font-mono text-sm">
          <p>{message.answer}</p>
        </div>
      </div>
    );
  }

  // AI Response Bubble
  const confidencePct = message.confidence !== null ? Math.round(message.confidence * 100) : 0;
  const barColor =
    confidencePct >= 70 ? "#06b6d4" : // cyan
    confidencePct >= 40 ? "#f59e0b" : "#ef4444"; // orange, red

  const exportAnswer = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("TrustLayer - Verified Answer Export", 20, 20);
    doc.setFontSize(10);
    doc.text(`Trust Score: ${confidencePct}% | Hallucination Guard: Active`, 20, 30);
    
    doc.setFontSize(12);
    const splitAnswer = doc.splitTextToSize(message.answer, 170);
    doc.text(splitAnswer, 20, 45);
    
    if (message.citations && message.citations.length > 0) {
      const yStart = 45 + (splitAnswer.length * 7) + 10;
      doc.setFontSize(14);
      doc.text("Verified Sources:", 20, yStart);
      doc.setFontSize(10);
      message.citations.forEach((c, i) => {
        doc.text(`${i+1}. ${c.doc} - Page ${c.page}`, 20, yStart + 10 + (i * 7));
      });
    }
    
    doc.save("TrustLayer_Verified_Report.pdf");
    toast.success("Answer exported to PDF");
  };

  const copyAnswer = () => {
    const citationText = (message.citations || []).map(c => `[${c.doc}, p.${c.page}]`).join(", ");
    navigator.clipboard.writeText(`${message.answer}\n\nSources: ${citationText}`);
    toast.success("Answer copied to clipboard!");
  };

  return (
    <div className="flex justify-start mb-6 w-full">
      <div className="bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-2xl rounded-tl-sm p-6 w-[85%] relative overflow-hidden group">
        
        {/* Top ActionBar */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={copyAnswer} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 text-gray-400 hover:text-white" title="Copy to Clipboard">
            📋
          </button>
          <button onClick={exportAnswer} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 text-gray-400 hover:text-white" title="Export to PDF">
            📥
          </button>
        </div>

        {/* Answer Module */}
        <p className="text-gray-200 mb-6 leading-relaxed text-[15px] font-light relative z-10">{message.answer}</p>

        {/* Diagnostic Badges */}
        <div className="relative z-10">
          <HallucinationBadge 
            warning={message.is_hallucinated || message.is_conflict ? message.warning : null} 
            isConflict={message.is_conflict}
          />
          <OutdatedWarningBadge warning={message.outdated_warning} />
        </div>
        
        {message.citations && (
          <div className="relative z-10">
            <MultiDocConflict citations={message.citations} />
          </div>
        )}

        {/* AI Trust Gauge */}
        <div className="mb-4 bg-black/40 p-4 rounded-xl border border-white/5 relative z-10">
          <div className="flex justify-between text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
            <span>Cosine Relevance</span>
            <span style={{ color: barColor }} className="drop-shadow-md">{confidencePct}% Trust Score</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_10px_${barColor}]`}
              style={{ width: `${confidencePct}%`, background: barColor }}
            />
          </div>
        </div>

        {/* Interactive Data Pane */}
        {(message.citations?.length > 0 || message.chunks_used > 0) && (
          <div className="flex gap-4 border-t border-gray-100 pt-3 mt-2">
            {message.citations?.length > 0 && (
              <button
                onClick={() => setShowCitations(!showCitations)}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  showCitations ? "text-blue-800" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                📍 References ({message.citations.length})
              </button>
            )}

            {message.chunks_used > 0 && (
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  showReasoning ? "text-purple-800" : "text-purple-600 hover:text-purple-700"
                }`}
              >
                🔍 Agent Telemetry
              </button>
            )}
          </div>
        )}

        {/* Expandable Views */}
        {showCitations && message.citations?.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 transition-opacity">
            {message.citations.map((c, i) => (
              <CitationCard key={i} citation={c} />
            ))}
          </div>
        )}

        {message.chunks_used > 0 && (
          <ReasoningPanel chunksUsed={message.chunks_used} open={showReasoning} />
        )}

        {/* Suggested Follow-Ups */}
        {message.followups && message.followups.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-mono">Suggested Next Queries</p>
            <div className="flex flex-wrap gap-2">
              {message.followups.map((f, i) => (
                <button
                  key={i}
                  onClick={() => onFollowup && onFollowup(f)}
                  className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs py-1.5 px-3 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all text-left"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
