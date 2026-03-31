import { useState } from "react";
import CitationCard from "./CitationCard";
import HallucinationBadge from "./HallucinationBadge";
import ReasoningPanel from "./ReasoningPanel";
import MultiDocConflict from "./MultiDocConflict";

export default function MessageBubble({ message }) {
  const [showCitations, setShowCitations] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // User Bubble
  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white rounded-xl p-4 max-w-2xl shadow">
          <p>{message.text}</p>
        </div>
      </div>
    );
  }

  // AI Response Bubble
  const confidencePct = message.confidence !== null ? Math.round(message.confidence * 100) : 0;
  const barColor =
    confidencePct >= 70 ? "#22c55e" :
    confidencePct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex justify-start mb-6">
      <div className="bg-white border shadow-sm rounded-xl p-5 max-w-2xl w-full hover:shadow-md transition-shadow">
        
        {/* Answer Module */}
        <p className="text-gray-900 mb-5 leading-relaxed text-[15px]">{message.answer}</p>

        {/* Diagnostic Badges */}
        <HallucinationBadge warning={message.is_hallucinated ? message.warning : null} />
        
        {message.citations && <MultiDocConflict citations={message.citations} />}

        {/* AI Trust Gauge */}
        <div className="mb-4 bg-gray-50 p-3 rounded-lg border">
          <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
            <span>Cosine Relevance</span>
            <span style={{ color: barColor }}>{confidencePct}% Trust Score</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out`}
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
      </div>
    </div>
  );
}
