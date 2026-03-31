# 🚀 InclusionX - KnowledgeOS: 4-Day Execution Plan

## 📌 Project Overview
**KnowledgeOS** is an AI-Powered Enterprise Knowledge Copilot with Contextual Citation Tracing, being built for Mini SIH 2026.
Our primary differentiator: **We don't just provide answers; we prove them with exact citations, confidence scores, and hallucination flags.**

**Total Timeline:** 4 Days (Accelerated from original 5 days)

---

## 🗓️ 4-Day Sprint Breakdown

### 🔴 Day 1: Backend Foundation & Data Pipeline
**Goal:** Setup the FastAPI backend, parse PDFs, and store chunks in a vector database (FAISS).
- [x] Initialize Python environment and install dependencies (`requirements.txt`).
- [x] **Task 1.1:** Build `services/ingestion.py` - Extract text from PDFs using `PyMuPDF` with page numbers.
- [x] **Task 1.2:** Implement chunking logic using `LangChain` to overlap text and maintain context.
- [x] **Task 1.3:** Setup FAISS local vector database and index chunks via `sentence-transformers`.
- [x] **Task 1.4:** Create `POST /upload` route in `main.py` to handle document uploads.
- [x] **Verification:** Can successfully hit the `/upload` API via cURL and inspect FAISS indices on disk.

### 🟡 Day 2: AI Generation & "Trust Layer"
**Goal:** Hook up Gemini API, implement RAG, and build the confidence/hallucination logic.
- [x] **Task 2.1:** Build `services/retrieval.py` to retrieve top-k chunks from FAISS based on user query.
- [x] **Task 2.2:** Build `services/generation.py` - Feed retrieved chunks to Gemini API (`gemini-1.5-flash`) for answer generation.
- [x] **Task 2.3:** Build `services/confidence.py` - Calculate a 0-100% confidence score using cosine similarity.
- [x] **Task 2.4:** Build `services/hallucination.py` - Implement threshold checks (e.g., flag < 35% similarity).
- [x] **Task 2.5:** Wire everything to a `POST /query` endpoint in `main.py` returning answer + citations + metadata.
- [x] **Verification:** cURL the `/query` endpoint and receive a structured JSON response with answers and citations.

### 🟢 Day 3: Frontend Core (React + Tailwind)
**Goal:** Set up the user interface for chatting and viewing documents.
- [x] Initialize Vite React app + Tailwind CSS in `frontend/`.
- [x] **Task 3.1:** Build `DocumentUpload.jsx` with a drag-and-drop interface connected to `/upload`.
- [x] **Task 3.2:** Build the main `ChatWindow.jsx` structure (input box, message list).
- [x] **Task 3.3:** Build `MessageBubble.jsx` to parse structured backend responses (Answers + Citations).
- [x] **Task 3.4:** Add the visual "Confidence Bar" component based on the backend trust score.
- [x] **Verification:** User can upload a sample PDF in the browser, type a query, and see a basic answer with a green/yellow/red confidence bar.

### 🟣 Day 4: UI Polish, Edge Cases & Demo Prep
**Goal:** Finalize the killer features that will win the hackathon and record the submission.
- [x] **Task 4.1:** Build `CitationCard.jsx` (click to expand the exact sentence and page number).
- [x] **Task 4.2:** Build `HallucinationBadge.jsx` - Display a clear warning when the AI is guessing.
- [x] **Task 4.3:** Build `ReasoningPanel.jsx` (expandable debug menu showing chunk usage).
- [x] **Task 4.4:** (Optional) Add conflict detector if multiple documents give contradicting answers.
- [x] **Task 4.5:** Final End-to-End QA Testing with tricky "Hallucinated" questions.
- [x] **Task 4.6:** Record the 3-minute final Loom/OBS Pitch video.
- [x] **Verification:** Flawless Demo ready for submission.

---

## 🛠️ Tech Stack Reminder
- **Frontend:** React + Tailwind CSS + Axios
- **Backend:** Python FastAPI + Uvicorn
- **AI/LLM:** Google Gemini API (`gemini-1.5-flash`)
- **Embeddings:** `sentence-transformers` (`all-MiniLM-L6-v2`)
- **Vector DB:** Local FAISS
- **PDF Parser:** `PyMuPDF` (`fitz`)

## ⚡ Next Immediate Action:
Start with **Day 1: Backend Foundation**.
- Let me know if you are ready to execute Day 1, and I will begin scaffolding the backend directory and implementing the ingestion pipeline.
