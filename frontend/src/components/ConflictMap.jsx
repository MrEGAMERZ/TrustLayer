import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SEVERITY_CONFIG = {
  high: {
    badge: "bg-red-500/15 text-red-300 border-red-500/30",
    bar: "#ef4444",
    glow: "rgba(239,68,68,0.35)",
    label: "HIGH",
    dot: "bg-red-400",
  },
  low: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    bar: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    label: "LOW",
    dot: "bg-amber-400",
  },
};

function SeverityPill({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
  return (
    <span
      className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-widest ${cfg.badge}`}
    >
      {cfg.label}
    </span>
  );
}

function ConflictRow({ conflict }) {
  const cfg = SEVERITY_CONFIG[conflict.severity] || SEVERITY_CONFIG.low;
  const delta = Math.abs(conflict.value_a - conflict.value_b);
  const pctDiff = Math.round(
    (delta / Math.max(conflict.value_a, conflict.value_b)) * 100
  );

  return (
    <div
      className="rounded-xl border border-white/[0.07] overflow-hidden"
      style={{ boxShadow: `0 0 12px ${cfg.glow}` }}
    >
      {/* Subject header */}
      <div className="px-3 py-2 flex items-center justify-between bg-white/[0.03]">
        <span className="text-[11px] text-white font-medium capitalize">
          {conflict.subject}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-gray-600">
            {pctDiff}% diff
          </span>
          <SeverityPill severity={conflict.severity} />
        </div>
      </div>

      {/* Value comparison grid */}
      <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
        {/* Doc A */}
        <div className="px-3 py-2.5 space-y-1">
          <p
            className="text-[9px] font-mono text-gray-600 truncate"
            title={conflict.doc_a}
          >
            {conflict.doc_a.length > 18
              ? conflict.doc_a.slice(0, 16) + "…"
              : conflict.doc_a}
          </p>
          {conflict.year_a && (
            <p className="text-[8px] text-amber-500/50 font-mono">
              {conflict.year_a}
            </p>
          )}
          <p className="text-[18px] font-light text-white tabular-nums">
            {conflict.value_a}
            <span className="text-[10px] text-gray-500 ml-1">
              {conflict.unit_a}
            </span>
          </p>
          <p className="text-[9px] text-gray-600 font-mono">
            p.{conflict.page_a}
          </p>
        </div>

        {/* Doc B */}
        <div className="px-3 py-2.5 space-y-1">
          <p
            className="text-[9px] font-mono text-gray-600 truncate"
            title={conflict.doc_b}
          >
            {conflict.doc_b.length > 18
              ? conflict.doc_b.slice(0, 16) + "…"
              : conflict.doc_b}
          </p>
          {conflict.year_b && (
            <p className="text-[8px] text-amber-500/50 font-mono">
              {conflict.year_b}
            </p>
          )}
          <p
            className="text-[18px] font-light tabular-nums"
            style={{ color: cfg.bar }}
          >
            {conflict.value_b}
            <span className="text-[10px] text-gray-500 ml-1">
              {conflict.unit_b}
            </span>
          </p>
          <p className="text-[9px] text-gray-600 font-mono">
            p.{conflict.page_b}
          </p>
        </div>
      </div>

      {/* Delta bar */}
      <div className="px-3 pb-2.5">
        <div className="h-0.5 w-full bg-white/[0.05] rounded-full overflow-hidden mt-1">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(pctDiff, 100)}%`,
              background: cfg.bar,
              boxShadow: `0 0 6px ${cfg.glow}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ConflictMap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_URL}/knowledge-graph`);
      setData(resp.data);
      setLastFetched(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch knowledge graph:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const highConflicts = data?.conflicts?.filter((c) => c.severity === "high") ?? [];
  const lowConflicts  = data?.conflicts?.filter((c) => c.severity === "low")  ?? [];

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
            Conflict Map
          </span>
          {data && data.conflict_count > 0 && (
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
              {data.conflict_count} found
            </span>
          )}
        </div>
        <button
          onClick={fetchConflicts}
          disabled={loading}
          className="w-6 h-6 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-cyan-400 transition-colors"
          title="Refresh conflict map"
        >
          <svg
            className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* No docs yet */}
      {!data && !loading && (
        <div className="glass-liquid rounded-xl p-4 text-center space-y-1">
          <p className="text-2xl">⚡</p>
          <p className="text-[11px] text-gray-400">Upload 2+ documents</p>
          <p className="text-[10px] text-gray-600">to generate a conflict map</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-liquid rounded-xl p-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] text-gray-500">Scanning documents…</span>
        </div>
      )}

      {/* No conflicts found */}
      {data && data.conflict_count === 0 && (
        <div className="glass-liquid rounded-xl p-4 text-center space-y-1">
          <p className="text-2xl">✅</p>
          <p className="text-[11px] text-gray-400">No conflicts detected</p>
          <p className="text-[10px] text-gray-600">
            {Object.keys(data.doc_facts || {}).length} document(s) scanned
          </p>
        </div>
      )}

      {/* Conflict list */}
      {data && data.conflict_count > 0 && (
        <>
          {/* Summary pill */}
          <div className="glass-liquid rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                <span className="text-[10px] text-gray-400">
                  {highConflicts.length} critical
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] text-gray-400">
                  {lowConflicts.length} minor
                </span>
              </div>
            </div>
            {lastFetched && (
              <span className="text-[8px] text-gray-700 font-mono">
                {lastFetched}
              </span>
            )}
          </div>

          {/* High severity first */}
          {highConflicts.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] text-red-400/70 uppercase tracking-widest font-mono px-1">
                ⚡ Critical Conflicts
              </p>
              {highConflicts.map((c, i) => (
                <ConflictRow key={i} conflict={c} />
              ))}
            </div>
          )}

          {/* Low severity */}
          {lowConflicts.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] text-amber-400/70 uppercase tracking-widest font-mono px-1">
                ⚠ Minor Conflicts
              </p>
              {lowConflicts.map((c, i) => (
                <ConflictRow key={i} conflict={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
