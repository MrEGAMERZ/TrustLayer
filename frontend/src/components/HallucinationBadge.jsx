export default function HallucinationBadge({ warning, isConflict }) {
  if (!warning) return null;

  const bgColor = isConflict ? "bg-orange-500/10" : "bg-red-500/10";
  const borderColor = isConflict ? "border-orange-500" : "border-red-500";
  const textColor = isConflict ? "text-orange-200" : "text-red-200";
  const label = isConflict ? "Data Conflict Detected" : "Integrity Warning";

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} backdrop-blur-md rounded-r-2xl p-4 mb-4 shadow-2xl flex items-start gap-4 transition-all animate-pulse`}>
      <span className="text-xl">{isConflict ? "⚖️" : "⚠️"}</span>
      <div className="flex flex-col">
        <span className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold ${textColor}`}>{label}</span>
        <span className="text-sm text-gray-300 mt-1 font-light italic leading-tight">{warning}</span>
      </div>
    </div>
  );
}

export function OutdatedWarningBadge({ warning }) {
  if (!warning) return null;
  return (
    <div className="bg-amber-500/10 border-l-4 border-amber-400 backdrop-blur-md rounded-r-2xl p-4 mb-4 shadow-xl flex items-start gap-4">
      <span className="text-xl">🕐</span>
      <div className="flex flex-col">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-amber-300">
          Temporal Source Warning
        </span>
        <span className="text-sm text-amber-100 mt-1 font-light leading-tight">{warning}</span>
      </div>
    </div>
  );
}
