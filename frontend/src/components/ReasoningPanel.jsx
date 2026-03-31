export default function ReasoningPanel({ chunksUsed, open }) {
  if (!open) return null;

  return (
    <div className="mt-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-900 leading-relaxed shadow-inner">
      <div className="flex items-center gap-2 mb-2 border-b border-purple-200 pb-2">
         <span className="font-bold text-lg text-purple-700">🔍</span>
         <span className="font-semibold text-purple-800 tracking-wide uppercase text-xs">Trust Engine Telemetry</span>
      </div>
      <p>
        Answer generation engaged the LangChain vector-store pipeline. 
        <strong> {chunksUsed} </strong> distinct document sections were retrieved and ranked via 
        <em> sentence-transformers (cosine similarity mapping) </em> to form the highest-confidence context.
      </p>
    </div>
  );
}
