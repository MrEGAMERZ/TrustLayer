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
  const [copied, setCopied]               = useState(false);

  // ── System event bubble
  if (message.role === "system") {
    return (
      <div className="flex justify-center my-4 animate-fade-in">
        <div className="inline-flex items-center gap-3 glass border border-cyan-500/20 text-cyan-300 rounded-xl px-4 py-3 max-w-2xl text-[12px] font-mono shadow-[0_0_20px_rgba(34,211,238,0.08)]">
          <span className="text-cyan-400 flex-shrink-0">✓</span>
          <p className="font-light">{message.answer}</p>
        </div>
      </div>
    );
  }

  // ── Trust score
  const pct      = message.confidence !== null ? Math.round(message.confidence * 100) : 0;
  const barColor = pct >= 70 ? "#22d3ee" : pct >= 40 ? "#fb923c" : "#ef4444";
  const barGlow  = pct >= 70
    ? "rgba(34,211,238,0.35)"
    : pct >= 40 ? "rgba(251,146,60,0.35)" : "rgba(239,68,68,0.35)";

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("TrustLayer — Verified Answer Export", 20, 20);
    doc.setFontSize(10);
    doc.text(`Trust Score: ${pct}%  |  Hallucination Guard: Active`, 20, 30);
    doc.setFontSize(12);
    const split = doc.splitTextToSize(message.answer || "", 170);
    doc.text(split, 20, 45);
    if (message.citations?.length) {
      const yStart = 45 + split.length * 7 + 10;
      doc.setFontSize(14);
      doc.text("Verified Sources:", 20, yStart);
      doc.setFontSize(10);
      message.citations.forEach((c, i) => doc.text(`${i + 1}. ${c.doc} — Page ${c.page}`, 20, yStart + 12 + i * 7));
    }
    doc.save("TrustLayer_Report.pdf");
    toast.success("Exported to PDF");
  };

  const copyText = () => {
    const cites = (message.citations || []).map(c => `[${c.doc}, p.${c.page}]`).join(", ");
    navigator.clipboard.writeText(`${message.answer}\n\nSources: ${cites}`);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-start w-full animate-fade-in">
      <div className="w-[90%] md:w-[85%] relative group">

        {/* Main card */}
        <div className="glass-liquid border border-white/[0.07] rounded-2xl rounded-tl-sm overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.35)] hover:border-white/12 transition-all duration-300">

          {/* Top meta bar */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.05] bg-white/[0.015]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
                <span className="text-[10px]">🛡️</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest">TrustLayer · Sentinel V2</span>
            </div>
            {/* Action buttons — hover reveal */}
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyText}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/8 border border-white/[0.06] text-gray-500 hover:text-gray-200 transition-all text-[10px]"
                title="Copy"
              >
                {copied ? <span className="text-emerald-400">✓</span> : '📋'}
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/8 border border-white/[0.06] text-gray-500 hover:text-gray-200 transition-all text-[10px]"
                title="Export PDF"
              >
                📥
              </button>
            </div>
          </div>

          {/* Answer body */}
          <div className="px-5 py-5">
            <p className="prose-ai text-[14px] whitespace-pre-wrap">{message.answer}</p>
          </div>

          {/* Diagnostic badges */}
          {(message.is_hallucinated || message.is_conflict || message.outdated_warning) && (
            <div className="px-5 pb-2 space-y-2">
              <HallucinationBadge
                warning={message.is_hallucinated || message.is_conflict ? message.warning : null}
                isConflict={message.is_conflict}
              />
              <OutdatedWarningBadge warning={message.outdated_warning} />
            </div>
          )}

          {/* Multi-doc conflict */}
          {message.citations && (
            <div className="px-5 pb-2">
              <MultiDocConflict citations={message.citations} />
            </div>
          )}

          {/* Trust gauge */}
          {message.confidence !== null && (
            <div className="px-5 pb-4">
              <div className="bg-black/25 rounded-xl p-3.5 border border-white/[0.04] space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                  <span className="text-gray-600">Cosine Relevance</span>
                  <span style={{ color: barColor }}>{pct}% Trust Score</span>
                </div>
                <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-[1200ms] ease-out"
                    style={{
                      width: `${pct}%`,
                      background: barColor,
                      boxShadow: `0 0 10px ${barGlow}`,
                      animation: 'bar-grow 1.2s ease-out both',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* References / Telemetry toggles */}
          {(message.citations?.length > 0 || message.chunks_used > 0) && (
            <div className="flex items-center gap-1 px-5 pb-4 border-t border-white/[0.04] pt-3">
              {message.citations?.length > 0 && (
                <button
                  onClick={() => setShowCitations(s => !s)}
                  className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                    showCitations
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-200 hover:border-white/15'
                  }`}
                >
                  <span>📍</span>
                  <span>References ({message.citations.length})</span>
                </button>
              )}
              {message.chunks_used > 0 && (
                <button
                  onClick={() => setShowReasoning(s => !s)}
                  className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                    showReasoning
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                      : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-200 hover:border-white/15'
                  }`}
                >
                  <span>🔍</span>
                  <span>Telemetry ({message.chunks_used} chunks)</span>
                </button>
              )}
            </div>
          )}

          {/* Expanded citations */}
          {showCitations && message.citations?.length > 0 && (
            <div className="px-5 pb-4 space-y-2 animate-slide-up">
              {message.citations.map((c, i) => (
                <CitationCard key={i} citation={c} />
              ))}
            </div>
          )}

          {/* Reasoning panel */}
          {message.chunks_used > 0 && (
            <div className={showReasoning ? "px-5 pb-4" : ""}>
              <ReasoningPanel chunksUsed={message.chunks_used} open={showReasoning} />
            </div>
          )}

          {/* Suggested follow-ups */}
          {message.followups?.length > 0 && (
            <div className="px-5 pb-5 pt-2 border-t border-white/[0.04]">
              <p className="text-[9px] text-gray-600 uppercase tracking-[0.25em] mb-2 font-mono">Suggested queries</p>
              <div className="flex flex-wrap gap-2">
                {message.followups.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => onFollowup?.(f)}
                    className="text-[11px] bg-cyan-500/8 border border-cyan-500/20 text-cyan-300/80 px-3 py-1.5 rounded-full hover:bg-cyan-500/15 hover:text-cyan-200 transition-all text-left"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
