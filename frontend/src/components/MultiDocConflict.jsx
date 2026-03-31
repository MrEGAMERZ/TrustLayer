export default function MultiDocConflict({ citations }) {
  if (!citations || citations.length < 2) return null;

  // Extract unique documents
  const docs = new Set(citations.map(c => c.doc));

  if (docs.size > 1) {
    return (
      <div className="mt-3 mb-3 bg-orange-50 border border-orange-200 p-3 rounded-lg text-sm flex gap-3 shadow-inner">
        <span className="text-xl">⚖️</span>
        <div>
          <span className="font-bold text-orange-900 block mb-1">Multi-Doc Synthesis Detected</span>
          <span className="text-orange-800">
            This answer bridges context from {docs.size} different documents.
            If they contain contradicting policies, ensure you verify the citations carefully!
          </span>
        </div>
      </div>
    );
  }

  return null;
}
