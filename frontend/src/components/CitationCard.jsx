export default function CitationCard({ citation }) {
  return (
    <div className="bg-white border rounded-lg p-3 text-sm shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-2 mb-2 items-center">
        <span className="bg-gray-100 border px-2 py-0.5 rounded text-xs font-semibold text-gray-700">📄 {citation.doc}</span>
        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-medium border border-gray-300">Page {citation.page}</span>
      </div>
      <p className="text-gray-600 italic border-l-2 border-blue-400 pl-3 leading-relaxed">
        "{citation.excerpt}"
      </p>
    </div>
  );
}
