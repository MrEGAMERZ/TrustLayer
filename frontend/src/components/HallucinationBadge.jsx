export default function HallucinationBadge({ warning }) {
  if (!warning) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-4 shadow-sm flex items-start gap-3 w-full">
      <span className="text-xl">⚠️</span>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-red-900">Hallucination Warning</span>
        <span className="text-sm text-red-800">{warning}</span>
      </div>
    </div>
  );
}
