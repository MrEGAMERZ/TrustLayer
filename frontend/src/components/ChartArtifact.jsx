import { useState } from "react";

/**
 * Pure SVG bar chart artifact — renders inline in chat like Claude's artifacts.
 * No external charting library needed.
 */
export default function ChartArtifact({ chartData }) {
  const [hovered, setHovered] = useState(null); // { topic, docIdx }

  if (!chartData || !chartData.datasets || chartData.datasets.length < 2) return null;

  const { title, topics, datasets } = chartData;

  // Filter topics to only those with data in at least 2 docs
  const validTopics = topics.filter(topic =>
    datasets.filter(ds => ds.values?.[topic] != null).length >= 2
  );

  if (validTopics.length === 0) return null;

  const BAR_HEIGHT = 28;
  const GAP = 8;
  const GROUP_GAP = 20;
  const LABEL_WIDTH = 140;
  const BAR_AREA = 220;
  const DOC_COUNT = datasets.length;

  const groupHeight = DOC_COUNT * BAR_HEIGHT + (DOC_COUNT - 1) * GAP;
  const totalHeight = validTopics.length * (groupHeight + GROUP_GAP) + 40;

  // Find global max value for scaling
  let globalMax = 0;
  validTopics.forEach(topic => {
    datasets.forEach(ds => {
      const v = ds.values?.[topic]?.value ?? 0;
      if (v > globalMax) globalMax = v;
    });
  });

  const scaleX = (value) => (value / Math.max(globalMax, 1)) * BAR_AREA;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 overflow-hidden bg-black/30 backdrop-blur-sm shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs">
            📊
          </div>
          <span className="text-[11px] font-mono text-violet-300/80 uppercase tracking-widest">
            Chart Artifact
          </span>
        </div>
        <span className="text-[10px] text-gray-600 font-light">{title}</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-2.5 border-b border-white/[0.04]">
        {datasets.map((ds, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: ds.color, boxShadow: `0 0 6px ${ds.color}60` }}
            />
            <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]" title={ds.doc}>
              {ds.doc.length > 18 ? ds.doc.slice(0, 16) + "…" : ds.doc}
            </span>
          </div>
        ))}
      </div>

      {/* Chart body */}
      <div className="px-5 py-4 overflow-x-auto">
        <svg
          width={LABEL_WIDTH + BAR_AREA + 60}
          height={totalHeight}
          className="overflow-visible"
        >
          {validTopics.map((topic, topicIdx) => {
            const groupY = topicIdx * (groupHeight + GROUP_GAP) + 20;

            return (
              <g key={topic}>
                {/* Topic label */}
                <text
                  x={LABEL_WIDTH - 8}
                  y={groupY + groupHeight / 2 + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="#6b7280"
                  fontFamily="monospace"
                  className="capitalize"
                >
                  {topic.length > 18 ? topic.slice(0, 16) + "…" : topic}
                </text>

                {/* Bars per doc */}
                {datasets.map((ds, docIdx) => {
                  const barY = groupY + docIdx * (BAR_HEIGHT + GAP);
                  const val = ds.values?.[topic]?.value ?? null;
                  const unit = ds.values?.[topic]?.unit ?? "";
                  if (val === null) return null;

                  const barW = scaleX(val);
                  const isHovered = hovered?.topic === topic && hovered?.docIdx === docIdx;

                  return (
                    <g key={docIdx}
                      onMouseEnter={() => setHovered({ topic, docIdx, val, unit, doc: ds.doc })}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Track */}
                      <rect
                        x={LABEL_WIDTH}
                        y={barY}
                        width={BAR_AREA}
                        height={BAR_HEIGHT}
                        rx={6}
                        fill="rgba(255,255,255,0.03)"
                      />
                      {/* Bar */}
                      <rect
                        x={LABEL_WIDTH}
                        y={barY}
                        width={barW}
                        height={BAR_HEIGHT}
                        rx={6}
                        fill={ds.color}
                        opacity={isHovered ? 1 : 0.75}
                        style={{ transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s" }}
                      />
                      {/* Glow overlay */}
                      {isHovered && (
                        <rect
                          x={LABEL_WIDTH}
                          y={barY}
                          width={barW}
                          height={BAR_HEIGHT}
                          rx={6}
                          fill={ds.color}
                          opacity={0.12}
                          filter={`blur(4px)`}
                        />
                      )}
                      {/* Value label */}
                      <text
                        x={LABEL_WIDTH + barW + 8}
                        y={barY + BAR_HEIGHT / 2 + 4}
                        fontSize={10}
                        fill={ds.color}
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {val}{unit ? ` ${unit}` : ""}
                      </text>
                    </g>
                  );
                })}

                {/* Separator line */}
                {topicIdx < validTopics.length - 1 && (
                  <line
                    x1={LABEL_WIDTH}
                    y1={groupY + groupHeight + GROUP_GAP / 2}
                    x2={LABEL_WIDTH + BAR_AREA + 50}
                    y2={groupY + groupHeight + GROUP_GAP / 2}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={1}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="px-5 pb-3">
          <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: datasets[hovered.docIdx]?.color }} />
            <span className="text-[11px] text-gray-300 font-mono">
              <span className="text-gray-500">{hovered.doc}:</span>{" "}
              <span className="font-bold" style={{ color: datasets[hovered.docIdx]?.color }}>
                {hovered.val} {hovered.unit}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Footer badge */}
      <div className="px-5 pb-3 flex items-center gap-1.5">
        <span className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">
          ⚡ Generated by TrustLayer · KnowledgeGraph Engine · {validTopics.length} metrics compared
        </span>
      </div>
    </div>
  );
}
