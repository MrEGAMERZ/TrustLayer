export default function HallucinationBadge({ warning, isConflict }) {
  if (!warning) return null;

  const cfg = isConflict
    ? { bg: 'bg-orange-500/8',  border: 'border-orange-500/40',  text: 'text-orange-200',  label: 'text-orange-400',  icon: '⚖️', title: 'Data Conflict Detected' }
    : { bg: 'bg-red-500/8',     border: 'border-red-500/40',     text: 'text-red-200',     label: 'text-red-400',     icon: '⚠️', title: 'Integrity Warning' };

  return (
    <div className={`${cfg.bg} border border-l-4 ${cfg.border} rounded-r-xl rounded-l-none p-3.5 flex items-start gap-3 animate-fade-in`}>
      <span className="text-base flex-shrink-0 mt-0.5">{cfg.icon}</span>
      <div className="flex flex-col min-w-0">
        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] font-bold ${cfg.label} mb-1`}>{cfg.title}</span>
        <span className={`text-[12px] ${cfg.text} font-light leading-relaxed`}>{warning}</span>
      </div>
    </div>
  );
}

export function OutdatedWarningBadge({ warning }) {
  if (!warning) return null;
  return (
    <div className="bg-amber-500/8 border border-l-4 border-amber-500/40 rounded-r-xl rounded-l-none p-3.5 flex items-start gap-3 animate-fade-in">
      <span className="text-base flex-shrink-0 mt-0.5">🕐</span>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold text-amber-400 mb-1">
          Temporal Source Warning
        </span>
        <span className="text-[12px] text-amber-200 font-light leading-relaxed">{warning}</span>
      </div>
    </div>
  );
}
