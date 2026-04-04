ROLE: You are a senior software engineer working on TrustLayer — an enterprise RAG system built with FastAPI (Python backend) + React/Vite/Tailwind (frontend). You are implementing features ONE AT A TIME.

STRICT RULES — READ BEFORE EVERY TASK:
1. DO NOT add any feature not explicitly listed in the current task
2. DO NOT refactor existing working code unless the task requires it
3. DO NOT change file names, folder structure, or imports unless specified
4. DO NOT add new npm packages or pip packages unless explicitly listed
5. DO NOT modify any file not directly related to the current task
6. After each task, stop and wait for confirmation before proceeding
7. If something is unclear, ASK — do not assume
8. Write clean, minimal code. No over-engineering.

CURRENT PROJECT STATE:
- Backend: FastAPI at backend/main.py with services: ingestion.py, retrieval.py, generation.py, confidence.py, hallucination.py
- Frontend: React + Tailwind at frontend/src with components: App.jsx, ChatWindow.jsx, MessageBubble.jsx, CitationCard.jsx, HallucinationBadge.jsx, ReasoningPanel.jsx, DocumentUpload.jsx, Sidebar.jsx, LandingPage.jsx, Dashboard.jsx
- The app has 3 views: landing → dashboard → chat
- Backend runs on port 8000, frontend on port 5173
- GEMINI_API_KEY is in backend/.env
- Vector store is FAISS saved to data/faiss_index/index.faiss + metadata.json
- Each chunk in metadata.json has: { "text", "page", "doc", "distance" }

===========================================================
FEATURE 1: TEMPORAL TRUST DECAY (BACKEND ONLY)
===========================================================

WHAT IT DOES:
When a PDF is uploaded, TrustLayer tries to extract the document date from its text.
The date is stored per-chunk in metadata.json.
When answering a query, if two chunks from different documents cover the same topic
but one document is older, the system flags it as OUTDATED_SOURCE_DETECTED in the answer.
The newer document's answer takes precedence.

FILES TO MODIFY:
- backend/services/ingestion.py
- backend/services/generation.py
- backend/main.py (only the /query response — add "outdated_warning" field)

DO NOT TOUCH:
- Any frontend files
- retrieval.py
- confidence.py
- hallucination.py

EXACT IMPLEMENTATION:

STEP 1 — In ingestion.py, add this function ABOVE the ingest_pdf function:

def extract_document_date(text: str):
    import re
    from datetime import datetime
    
    patterns = [
        (r'(?:Effective Date|Last Updated|Version Date|Date|Issued|Published)[:\s]+(\d{1,2}[\s/-]\w+[\s/-]\d{2,4})', None),
        (r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+(\d{4})\b', None),
        (r'\b(\d{4})[/-](\d{2})[/-](\d{2})\b', None),
        (r'\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b', None),
    ]
    
    sample = text[:3000]
    
    for pattern, _ in patterns:
        match = re.search(pattern, sample, re.IGNORECASE)
        if match:
            raw = match.group(0)
            for fmt in ["%B %d, %Y", "%B %d %Y", "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"]:
                try:
                    parts = re.findall(r'[\d]+', raw)
                    if len(parts) >= 3:
                        year = max(parts, key=lambda x: len(x))
                        if len(year) == 4:
                            return int(year)
                except:
                    pass
    
    return None

STEP 2 — In ingest_pdf(), after you open the doc and before the splitter loop, extract the date:

full_text = " ".join([page.get_text() for page in doc])
doc_year = extract_document_date(full_text)

STEP 3 — When building final_chunks, add "year" to each chunk:

final_chunks.append({
    "text": s,
    "page": item["page"],
    "doc": item["doc"],
    "year": doc_year
})

STEP 4 — In generation.py, modify the context building block to include year info and add conflict detection:

Replace the context building section with:

context_blocks = []
doc_years = {}

for i, c in enumerate(chunks):
    year_str = f", Year: {c['year']}" if c.get('year') else ""
    context_blocks.append(
        f"--- DATA NODE {i+1} [DOC: {c['doc']}, PAGE: {c['page']}{year_str}] ---\n{c['text']}"
    )
    if c.get('year'):
        doc_years[c['doc']] = c['year']

context = "\n\n".join(context_blocks)

# Check if multiple docs have different years on the same topic
outdated_warning = None
if len(doc_years) >= 2:
    years = list(doc_years.items())
    years.sort(key=lambda x: x[1])
    oldest_doc, oldest_year = years[0]
    newest_doc, newest_year = years[-1]
    if oldest_year != newest_year:
        outdated_warning = f"OUTDATED SOURCE WARNING: '{oldest_doc}' ({oldest_year}) may be superseded by '{newest_doc}' ({newest_year}). Answer is weighted toward the newer document."

Add outdated_warning as a return value — change the function signature to return a tuple:

return response.text.strip(), outdated_warning

STEP 5 — In main.py /query endpoint, update to handle the tuple return from generate_answer:

answer, outdated_warning = generate_answer(request.question, chunks)

Add to the return dict:
"outdated_warning": outdated_warning,

STOP HERE. Do not touch frontend. I will test the backend first.
Tell me when done and list every file you changed.

===========================================================
FEATURE 2: OUTDATED WARNING IN UI (FRONTEND ONLY)
===========================================================

Only proceed to this after I confirm Feature 1 works.

FILES TO MODIFY:
- frontend/src/components/MessageBubble.jsx
- frontend/src/components/HallucinationBadge.jsx

DO NOT TOUCH:
- Any backend files
- Any other frontend files

WHAT IT DOES:
If the API response has a non-null "outdated_warning" field, show a new badge
below the confidence bar in MessageBubble. Style it like a warning — amber/yellow,
with a clock emoji and the text from outdated_warning.

EXACT IMPLEMENTATION:

In HallucinationBadge.jsx, add a new exported component at the BOTTOM of the file:

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

In MessageBubble.jsx:
1. Import OutdatedWarningBadge from "./HallucinationBadge"
2. After the <HallucinationBadge /> line, add:
   <OutdatedWarningBadge warning={message.outdated_warning} />

STOP HERE. I will test before proceeding.

===========================================================
FEATURE 3: STRICT MODE TOGGLE (FULL STACK)
===========================================================

Only proceed after I confirm Feature 2 works.

FILES TO MODIFY:
- backend/main.py (QueryRequest model + /query endpoint)
- backend/services/generation.py (strict mode refusal logic)
- frontend/src/components/ChatWindow.jsx (toggle UI)

DO NOT TOUCH:
- ingestion.py, retrieval.py, confidence.py, hallucination.py
- Any other frontend components

BACKEND CHANGES:

In main.py, update QueryRequest model:
class QueryRequest(BaseModel):
    question: str
    strict_mode: bool = False

In /query endpoint, after getting trust score, add:

STRICT_MODE_THRESHOLD = 0.80

if request.strict_mode and trust["confidence"] < STRICT_MODE_THRESHOLD:
    return {
        "answer": f"⛔ SENTINEL REFUSAL — Query blocked in Strict Mode. Confidence ({round(trust['confidence']*100)}%) is below the enterprise threshold of 80%. This answer has been withheld to prevent decisions based on uncertain information.",
        "confidence": trust["confidence"],
        "is_hallucinated": False,
        "is_conflict": False,
        "outdated_warning": None,
        "warning": "Query refused by Strict Mode guardian.",
        "citations": [],
        "chunks_used": 0,
        "strict_refused": True
    }

Add "strict_refused": False to the normal return dict as well.

FRONTEND CHANGES:

In ChatWindow.jsx:
1. Add state: const [strictMode, setStrictMode] = useState(false)
2. In the axios.post call, add strict_mode: strictMode to the request body
3. Add a toggle button in the input area, BEFORE the textarea, at the left side:

<button
  onClick={() => setStrictMode(!strictMode)}
  title="Strict Mode: Refuse answers below 80% confidence"
  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
    strictMode
      ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
  }`}
>
  {strictMode ? '🔒 STRICT' : '🔓 STRICT'}
</button>

Place the button INSIDE the existing input wrapper div, before the textarea element.

STOP HERE. I will test before proceeding.

===========================================================
FEATURE 4: DOCUMENT DATE DISPLAY IN SIDEBAR
===========================================================

Only proceed after I confirm Feature 3 works.

FILES TO MODIFY:
- backend/main.py (/documents endpoint only)
- frontend/src/components/Sidebar.jsx

DO NOT TOUCH: everything else

BACKEND CHANGE:
In /documents endpoint, update to include year in response:

docs = {}
for c in chunks:
    doc_name = c["doc"]
    if doc_name not in docs:
        docs[doc_name] = {"chunks": 0, "year": c.get("year")}
    docs[doc_name]["chunks"] += 1

return {"documents": [{"name": k, "chunks": v["chunks"], "year": v["year"]} for k, v in docs.items()]}

FRONTEND CHANGE:
In Sidebar.jsx, in the document card where it shows chunk count, add below it:

{doc.year && (
  <span className="text-[10px] text-amber-400/70 font-mono mt-1 block">
    📅 Document Year: {doc.year}
  </span>
)}

STOP HERE. I will test before proceeding.

===========================================================
FEATURE 5: MULTI-DOC INGESTION FIX (APPEND NOT OVERWRITE)
===========================================================

Only proceed after I confirm Feature 4 works.

FILES TO MODIFY:
- backend/services/ingestion.py ONLY

CURRENT BUG: Every new upload OVERWRITES the FAISS index. So if you upload 2 PDFs,
only the second one is searchable.

FIX: Load existing index + metadata if they exist, then MERGE new chunks into it.

Replace the FAISS save section (Steps 4 and 5) in ingest_pdf() with:

# Load existing index if present, otherwise create new
index_path = "data/faiss_index/index.faiss"
meta_path = "data/faiss_index/metadata.json"

existing_chunks = []
if os.path.exists(index_path) and os.path.exists(meta_path):
    existing_index = faiss.read_index(index_path)
    with open(meta_path, "r") as f:
        existing_chunks = json.load(f)
    
    # Remove old entries for this same document (re-upload scenario)
    existing_chunks = [c for c in existing_chunks if c["doc"] != doc_name]
    
    # Rebuild index without old doc
    if existing_chunks:
        existing_texts = [c["text"] for c in existing_chunks]
        existing_embeddings = model.encode(existing_texts, convert_to_numpy=True, batch_size=32)
        dim = existing_embeddings.shape[1]
        merged_index = faiss.IndexFlatL2(dim)
        merged_index.add(existing_embeddings)
    else:
        dim = embeddings.shape[1]
        merged_index = faiss.IndexFlatL2(dim)
    
    merged_index.add(embeddings)
    all_chunks = existing_chunks + final_chunks
else:
    dim = embeddings.shape[1]
    merged_index = faiss.IndexFlatL2(dim)
    merged_index.add(embeddings)
    all_chunks = final_chunks

os.makedirs("data/faiss_index", exist_ok=True)
faiss.write_index(merged_index, index_path)
with open(meta_path, "w") as f:
    json.dump(all_chunks, f)

STOP HERE. I will test before proceeding.

===========================================================
TESTING CHECKLIST (for you to verify after each feature)
===========================================================

After Feature 1:
- Upload a PDF with a date in it (e.g. "Effective Date: January 1, 2020")
- Upload another PDF with a newer date
- curl POST /query and check response has "outdated_warning" field
- If single doc uploaded, outdated_warning should be null

After Feature 2:
- Upload two PDFs with different years
- Ask a question that pulls from both
- Should see amber "Temporal Source Warning" badge in UI

After Feature 3:
- Click STRICT toggle (turns red)
- Ask a vague question that scores low confidence
- Should see ⛔ SENTINEL REFUSAL message
- Turn strict off, same question should answer normally

After Feature 4:
- Upload a PDF with a year in it
- Check sidebar — should show "Document Year: 2024" under the doc

After Feature 5:
- Upload PDF 1, ask a question about it — works
- Upload PDF 2, ask a question about PDF 1 — STILL works (was broken before)
- Ask about both docs — gets info from both

===========================================================
GENERAL AGENT RULES REMINDER
===========================================================

- One feature at a time
- Stop after each feature and report what you changed
- Do not add console.logs, debug prints, or test code to production files
- Do not change variable names of existing working code
- Do not add TypeScript, do not convert JSX to TSX
- Do not install any new package without asking first
- If a file has a bug unrelated to current task, note it but do not fix it
- Match the existing code style exactly (no adding semicolons if file doesn't use them, etc.)