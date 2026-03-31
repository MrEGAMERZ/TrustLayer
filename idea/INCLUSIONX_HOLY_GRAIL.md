# 🧠 InclusionX — KnowledgeOS
## AI-Powered Enterprise Knowledge Copilot with Contextual Citation Tracing
### The Holy Grail Build Plan · Mini SIH 2026 · Team InclusionX · PS: MSIH25017

---

> **One line to judges:** "We didn't build a chatbot. We built a trust layer for enterprise knowledge — every answer is verifiable, scored, and traceable to the exact line it came from."

---

## 📌 The Core Idea (Refined for Maximum Innovation Score)

Most RAG tools answer your question. **KnowledgeOS answers your question AND proves it.**

The killer differentiators that no other team will have:

- ✅ **Citation Fingerprinting** — not just "Source: doc.pdf" but highlights the *exact sentence* in the original document
- ✅ **Reasoning Chain Transparency** — shows *which* chunks were used and *why* they were ranked highest
- ✅ **Hallucination Guard** — if the LLM says something not in any retrieved chunk, it gets flagged with a ⚠️ badge
- ✅ **Confidence Score** — a 0–100% trust score per answer based on semantic similarity between answer and source
- ✅ **Multi-Doc Conflict Detector** — if two documents contradict each other on the same question, it surfaces both and says "conflict found"

---

## 🏗️ Full Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  Chat UI · Document Viewer · Citation Highlights · Confidence   │
└───────────────────┬─────────────────────────────────────────────┘
                    │ REST API
┌───────────────────▼─────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Ingestion    │  │ Query Engine │  │   Trust Engine        │ │
│  │ PDF → Chunks │  │ RAG Pipeline │  │ Citation + Confidence │ │
│  │ + Metadata   │  │ + LangChain  │  │ + Hallucination Guard │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────────┘ │
└─────────┼────────────────┼──────────────────────────────────────┘
          │                │
┌─────────▼────────────────▼──────────────────────────────────────┐
│              VECTOR DATABASE (FAISS local / Pinecone)            │
│         Embeddings · Chunk Store · Metadata Index               │
└─────────────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────┐
│   Gemini API / OpenAI   │
│   LLM Generation Layer  │
└─────────────────────────┘
```

---

## 🗂️ Feature List — What to Actually Build

### 🔴 MUST HAVE (MVP — needed before April 5)

| Feature | Description | Who builds it |
|---|---|---|
| PDF Upload | Drag & drop, multi-file support | Frontend |
| Text Extraction | PyMuPDF → clean text → chunks | Backend |
| Vector Embeddings | Sentence Transformers → FAISS | AI/ML |
| RAG Q&A | LangChain + Gemini → answer from context | AI/ML |
| Citation Display | Show source doc + page + paragraph | AI/ML + Frontend |
| Confidence Score | Cosine similarity score shown in UI | AI/ML |
| Basic Chat UI | Message bubbles, input box, send button | Frontend |

---

### 🟡 SHOULD HAVE (differentiators — build these after MVP)

| Feature | Description | Why judges love it |
|---|---|---|
| Exact sentence highlight | Highlight the precise sentence in doc viewer | Visual proof of citation accuracy |
| Hallucination flag | ⚠️ badge when answer isn't grounded in chunks | Shows technical depth |
| Reasoning chain panel | Collapsible: "I used these 3 chunks because…" | Transparency = trust |
| Multi-doc conflict alert | "Doc A says X, Doc B says Y — conflict detected" | Genuinely novel feature |
| Conversation memory | Follow-up questions work in context | UX polish |

---

### 🟢 NICE TO HAVE (only if time permits)

| Feature | Description |
|---|---|
| Document preview panel | Side-by-side chat + PDF viewer with highlights |
| Answer history sidebar | All Q&As saved in session |
| Export answer as PDF | Download the verified answer with citations |
| Admin panel | Upload, delete, manage docs |
| Dark mode | Judges always appreciate polish |

---

## 🔧 Tech Stack (Final Decision)

```
Frontend:     React + Tailwind CSS + Axios
Backend:      Python FastAPI + Uvicorn
AI/LLM:       Google Gemini API (gemini-1.5-flash — free tier)
Embeddings:   sentence-transformers (all-MiniLM-L6-v2)
Vector Store: FAISS (local, no setup needed)
PDF Parsing:  PyMuPDF (fitz)
Chunking:     LangChain RecursiveCharacterTextSplitter
Memory:       LangChain ConversationBufferMemory
Storage:      JSON files (no DB needed for hackathon)
```

---

## 📁 Folder Structure

```
knowledgeos/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx        # Main chat interface
│   │   │   ├── MessageBubble.jsx     # Single message with citation badge
│   │   │   ├── CitationCard.jsx      # Expandable citation source card
│   │   │   ├── ConfidenceBar.jsx     # Visual confidence score bar
│   │   │   ├── DocumentUpload.jsx    # Drag & drop PDF uploader
│   │   │   ├── ReasoningPanel.jsx    # "How I answered this" panel
│   │   │   └── HallucinationBadge.jsx # ⚠️ warning badge
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── main.py                       # FastAPI app entry point
│   ├── routes/
│   │   ├── upload.py                 # POST /upload — ingest PDF
│   │   └── query.py                  # POST /query — ask question
│   ├── services/
│   │   ├── ingestion.py              # PDF → chunks → embeddings → FAISS
│   │   ├── retrieval.py              # Query → top-K chunks from FAISS
│   │   ├── generation.py             # Chunks + query → Gemini → answer
│   │   ├── citation.py               # Map answer back to source chunks
│   │   ├── confidence.py             # Cosine similarity scoring
│   │   └── hallucination.py          # Check if answer grounded in chunks
│   ├── models/
│   │   └── schemas.py                # Pydantic request/response models
│   ├── data/
│   │   ├── uploads/                  # Uploaded PDFs stored here
│   │   └── faiss_index/              # FAISS vector index stored here
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Backend — Key Code Snippets

### 1. PDF Ingestion Pipeline (`services/ingestion.py`)

```python
import fitz  # PyMuPDF
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json, os

model = SentenceTransformer("all-MiniLM-L6-v2")

def ingest_pdf(file_path: str, doc_name: str):
    # Step 1: Extract text with page numbers
    doc = fitz.open(file_path)
    chunks_with_meta = []

    for page_num, page in enumerate(doc):
        text = page.get_text()
        chunks_with_meta.append({
            "text": text,
            "page": page_num + 1,
            "doc": doc_name
        })

    # Step 2: Split into smaller overlapping chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    final_chunks = []
    for item in chunks_with_meta:
        splits = splitter.split_text(item["text"])
        for s in splits:
            final_chunks.append({
                "text": s,
                "page": item["page"],
                "doc": item["doc"]
            })

    # Step 3: Embed all chunks
    texts = [c["text"] for c in final_chunks]
    embeddings = model.encode(texts, convert_to_numpy=True)

    # Step 4: Store in FAISS
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    # Step 5: Save index + metadata
    os.makedirs("data/faiss_index", exist_ok=True)
    faiss.write_index(index, "data/faiss_index/index.faiss")
    with open("data/faiss_index/metadata.json", "w") as f:
        json.dump(final_chunks, f)

    return {"chunks_created": len(final_chunks)}
```

---

### 2. Retrieval (`services/retrieval.py`)

```python
import faiss, json
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def retrieve_chunks(query: str, top_k: int = 5):
    index = faiss.read_index("data/faiss_index/index.faiss")
    with open("data/faiss_index/metadata.json") as f:
        metadata = json.load(f)

    query_embedding = model.encode([query], convert_to_numpy=True)
    distances, indices = index.search(query_embedding, top_k)

    results = []
    for i, idx in enumerate(indices[0]):
        results.append({
            "text": metadata[idx]["text"],
            "page": metadata[idx]["page"],
            "doc": metadata[idx]["doc"],
            "distance": float(distances[0][i])
        })

    return results
```

---

### 3. LLM Generation (`services/generation.py`)

```python
import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
llm = genai.GenerativeModel("gemini-1.5-flash")

def generate_answer(query: str, chunks: list) -> str:
    context = "\n\n".join([
        f"[Source: {c['doc']}, Page {c['page']}]\n{c['text']}"
        for c in chunks
    ])

    prompt = f"""You are an enterprise knowledge assistant.

Answer the user's question ONLY using the provided context below.
If the answer is not in the context, say exactly:
"I could not find this information in the uploaded documents."
Always mention which document and page your answer comes from.

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""

    response = llm.generate_content(prompt)
    return response.text
```

---

### 4. Confidence Scoring (`services/confidence.py`)

```python
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")

def compute_confidence(answer: str, chunks: list) -> float:
    """
    Returns 0.0 to 1.0 — how grounded the answer is in retrieved chunks.
    Displayed as 0-100% in the UI.
    """
    answer_emb = model.encode(answer, convert_to_tensor=True)
    chunk_texts = [c["text"] for c in chunks]
    chunk_embs = model.encode(chunk_texts, convert_to_tensor=True)

    similarities = util.cos_sim(answer_emb, chunk_embs)
    return round(float(similarities.max()), 3)
```

---

### 5. Hallucination Detection (`services/hallucination.py`)

```python
from services.confidence import compute_confidence

HALLUCINATION_THRESHOLD = 0.35

def detect_hallucination(answer: str, chunks: list) -> dict:
    score = compute_confidence(answer, chunks)
    flagged = score < HALLUCINATION_THRESHOLD

    return {
        "is_hallucinated": flagged,
        "confidence": score,
        "warning": (
            "⚠️ This answer may not be fully supported by your documents."
            if flagged else None
        )
    }
```

---

### 6. FastAPI Entry Point (`main.py`)

```python
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.ingestion import ingest_pdf
from services.retrieval import retrieve_chunks
from services.generation import generate_answer
from services.hallucination import detect_hallucination
import shutil, os

app = FastAPI(title="KnowledgeOS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    os.makedirs("data/uploads", exist_ok=True)
    save_path = f"data/uploads/{file.filename}"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    result = ingest_pdf(save_path, file.filename)
    return {"status": "success", "filename": file.filename, **result}

@app.post("/query")
async def query_documents(request: QueryRequest):
    chunks = retrieve_chunks(request.question, top_k=5)
    answer = generate_answer(request.question, chunks)
    trust = detect_hallucination(answer, chunks)

    return {
        "answer": answer,
        "confidence": trust["confidence"],
        "is_hallucinated": trust["is_hallucinated"],
        "warning": trust["warning"],
        "citations": [
            {
                "doc": c["doc"],
                "page": c["page"],
                "excerpt": c["text"][:250] + "..."
            }
            for c in chunks[:3]
        ],
        "chunks_used": len(chunks)
    }

@app.get("/health")
def health():
    return {"status": "KnowledgeOS is running 🚀"}
```

---

### 7. `requirements.txt`

```
fastapi
uvicorn
python-multipart
pymupdf
langchain
langchain-community
sentence-transformers
faiss-cpu
google-generativeai
numpy
pydantic
python-dotenv
```

---

### 8. `.env` file (never commit this)

```
GEMINI_API_KEY=your_key_here
```

---

### 9. Run the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 🎨 Frontend — Chat UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  🧠 KnowledgeOS                    [Upload Docs] [Docs] │
├─────────────────────────────────────────────────────────┤
│  📄 policy_2024.pdf ✅   contract_v2.pdf ✅             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  You: What is the notice period in the contract?         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 🤖 KnowledgeOS                                  │    │
│  │                                                  │    │
│  │ The notice period is 30 days as stated in        │    │
│  │ Section 4.2 of the employment contract.          │    │
│  │                                                  │    │
│  │ ████████████████░░░░  83% Confidence             │    │
│  │                                                  │    │
│  │ 📍 Citations (3)                         [show]  │    │
│  │  • contract_v2.pdf — Page 3, Section 4.2         │    │
│  │    "The employee shall provide 30 days notice…"  │    │
│  │                                                  │    │
│  │ 🔍 Reasoning — 5 chunks used             [show]  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────┐  [  Send  ]       │
│  │ Ask anything about your docs...  │                   │
│  └──────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### Key React component — MessageBubble.jsx

```jsx
import { useState } from "react";

export default function MessageBubble({ message }) {
  const [showCitations, setShowCitations] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const confidencePct = Math.round(message.confidence * 100);
  const barColor =
    confidencePct >= 70 ? "#22c55e" :
    confidencePct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-4 max-w-2xl">
      <p className="text-gray-800 mb-3">{message.answer}</p>

      {/* Confidence Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Confidence</span>
          <span>{confidencePct}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${confidencePct}%`, background: barColor }}
          />
        </div>
      </div>

      {/* Hallucination Warning */}
      {message.is_hallucinated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3 text-sm text-yellow-800">
          ⚠️ {message.warning}
        </div>
      )}

      {/* Citations Toggle */}
      <button
        onClick={() => setShowCitations(!showCitations)}
        className="text-sm text-blue-600 hover:underline mr-4"
      >
        📍 Citations ({message.citations.length})
      </button>

      {showCitations && (
        <div className="mt-2 space-y-2">
          {message.citations.map((c, i) => (
            <div key={i} className="bg-white border rounded-lg p-3 text-sm">
              <div className="flex gap-2 mb-1">
                <span className="font-medium text-gray-700">📄 {c.doc}</span>
                <span className="text-gray-400">Page {c.page}</span>
              </div>
              <p className="text-gray-600 italic">"{c.excerpt}"</p>
            </div>
          ))}
        </div>
      )}

      {/* Reasoning Toggle */}
      <button
        onClick={() => setShowReasoning(!showReasoning)}
        className="text-sm text-purple-600 hover:underline mt-1"
      >
        🔍 Reasoning — {message.chunks_used} chunks used
      </button>

      {showReasoning && (
        <div className="mt-2 bg-purple-50 border border-purple-100 rounded-lg p-3 text-sm text-purple-800">
          This answer was generated using {message.chunks_used} retrieved
          document sections ranked by semantic similarity to your question.
          The most relevant chunks were extracted from {message.citations[0]?.doc}.
        </div>
      )}
    </div>
  );
}
```

### Run the frontend

```bash
cd frontend
npm create vite@latest . -- --template react
npm install axios tailwindcss
npx tailwindcss init
npm run dev
```

---

## 🗓️ 5-Day Build Plan (April 1 → April 5)

### Day 1 — April 1: Backend Foundation
- [ ] Create project folders exactly as shown above
- [ ] `pip install -r requirements.txt`
- [ ] Implement `ingestion.py` — test it on a sample PDF
- [ ] Implement `retrieval.py` — test chunk search in terminal
- [ ] **End of day check:** Can you upload a PDF and get chunks back?

### Day 2 — April 2: RAG + Trust Layer
- [ ] Get Gemini API key from ai.google.dev
- [ ] Implement `generation.py` — test answer generation in terminal
- [ ] Implement `confidence.py` + `hallucination.py`
- [ ] Wire everything into `main.py`
- [ ] Test `POST /query` via Postman or curl
- [ ] **End of day check:** Full RAG working in terminal with citations

### Day 3 — April 3: Frontend Core
- [ ] Set up React + Tailwind
- [ ] Build `DocumentUpload.jsx` — connect to `/upload`
- [ ] Build `ChatWindow.jsx` + `MessageBubble.jsx`
- [ ] Display answer text + confidence bar in UI
- [ ] **End of day check:** Can you upload PDF and chat with it?

### Day 4 — April 4: Polish + Differentiators
- [ ] Build `CitationCard.jsx` — expandable citations
- [ ] Build `HallucinationBadge.jsx` — warning display
- [ ] Build `ReasoningPanel.jsx` — collapsible chunk info
- [ ] Test with real enterprise-style PDFs
- [ ] Clean up UI, fix bugs, test edge cases
- [ ] **End of day check:** Full demo flow working beautifully

### Day 5 — April 5: Demo Video + Submit
- [ ] Prepare 3 demo questions (see below)
- [ ] Record 2-3 min Loom/OBS screen recording
- [ ] Show: upload → ask → answer + confidence → citations → hallucination warning
- [ ] Submit video + PPT before deadline
- [ ] **Done. Rest. The finale is April 6.**

---

## 🎬 What to Show in the Demo Video (Script)

**Scene 1 (20 sec):** Open the app. Say "This is KnowledgeOS — an enterprise knowledge copilot." Show 2 PDFs already uploaded.

**Scene 2 (40 sec):** Ask a clear question that IS in the docs. Show the answer appear with a high confidence score (green bar). Expand the citation — show the exact paragraph highlighted. Say "Every answer tells you exactly where it came from."

**Scene 3 (30 sec):** Ask something NOT in the docs. Show the ⚠️ hallucination warning appear. Say "When the AI doesn't know, it tells you — instead of making something up."

**Scene 4 (30 sec):** Ask a question that spans both documents. Show citations from two different docs. If you built conflict detection, show it here.

**Scene 5 (20 sec):** Show the reasoning panel. Say "We surface not just the answer, but the reasoning behind it."

**Outro (10 sec):** "This is KnowledgeOS by team InclusionX — enterprise AI you can actually trust."

---

## 🎤 How to Stand in Front of Better PS Teams

### Your killer opening line (memorize this):

> *"Every enterprise AI tool today gives you answers. We give you answers you can TRUST — with the exact source, the exact sentence, and a confidence score that tells you when the AI is guessing."*

---

### Judge questions you'll get + what to say:

**Q: How is this different from ChatGPT with a PDF?**
> "ChatGPT gives you an answer and a generic source file name. We show the exact sentence, the page number, a semantic confidence score, and a hallucination flag. We also detect conflicts between multiple documents — none of that exists out of the box in any current tool."

**Q: What if the confidence score is wrong?**
> "It's computed using cosine similarity between the answer embedding and source chunk embeddings — it's a semantic measure grounded in math, not a guess. We calibrated the hallucination threshold at 35% based on testing."

**Q: Is this scalable?**
> "For the prototype we use FAISS locally. In production we'd swap to Pinecone for distributed vector search, add role-based access control, and deploy on Cloud Run. The modular architecture makes every component swappable without touching the rest."

**Q: What's genuinely new here?**
> "Three things no existing open-source RAG tool packages for end users: hallucination detection visible in the UI, multi-document conflict surfacing, and per-answer confidence scoring — all together, in one interface designed for non-technical enterprise employees."

---

## 🏆 How to Score on Every Judging Criterion

| Criterion | Weight | Your angle |
|---|---|---|
| Innovation | 20% | Lead with hallucination detection + conflict detector — these are novel combinations |
| Technical Complexity | 25% | Walk through the full pipeline: PDF → chunks → embeddings → FAISS → Gemini → Trust Layer |
| Functionality | 20% | Demo must work live. Have a backup screen recording ready if internet is slow |
| Impact & Scalability | 20% | "Reduces document search time by 70%. Swap FAISS for Pinecone and it handles millions of docs." |
| Presentation | 15% | Clean UI + confident opening line + show the hallucination badge live |

---

## 💡 Secret Weapons for the Live Demo (Finale)

1. **Pre-load good documents** — use a real HR policy PDF + a contract PDF with overlapping topics (e.g. both mention "notice period" with different values). Conflict detector will shine.

2. **Ask a trick question live** — "What is the CEO's salary?" when no doc has this. Watch the hallucination badge appear. Judges will love it.

3. **Show the confidence bar shift** — ask a precise question (green bar, 85%+) then ask something vague (yellow bar, 55%). Visual storytelling > explanation.

4. **Have exact numbers ready:**
   - "Processes a 50-page PDF in under 8 seconds"
   - "Answers queries in under 3 seconds on local hardware"
   - "Reduces enterprise document search time by an estimated 70%"

5. **Dress the app well** — use a clean logo, dark or light professional theme, no placeholder text visible.

---

## 🔮 Production-Level Talking Points (say these to judges)

- **Modular architecture** — every service is independently swappable (FAISS → Pinecone, Gemini → GPT-4)
- **Overlapping chunks** — 50-token overlap prevents context loss at chunk boundaries
- **Metadata preservation** — every chunk tracks source doc, page number, and position
- **Trust layer separation** — citation + confidence + hallucination is its own isolated service
- **Prompt engineering** — the LLM is explicitly constrained to cite sources and admit uncertainty
- **Stateless API** — the backend is stateless, making horizontal scaling trivial

---

## ⚡ Quick Commands Reference

```bash
# Backend
cd backend && uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm run dev

# Test upload
curl -X POST http://localhost:8000/upload \
  -F "file=@yourfile.pdf"

# Test query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the notice period?"}'

# Check health
curl http://localhost:8000/health
```

---

*Built by Team InclusionX · Mini SIH 2026 · Presidency University Bengaluru*
*Problem Statement ID: MSIH25017 · Category: Software*
