# 🛡️ TrustLayer: Enterprise Knowledge Copilot
*(Formerly known as KnowledgeOS)*

Look, we've all seen a million "Chat with PDF" wrappers. You dump a document into an LLM, ask it a question, and cross your fingers hoping it didn't just invent the answer out of thin air to sound smart.

**That doesn't work for the enterprise.** You can't run a company on "maybe this is true." 

We didn't build just another chatbot. We built a **Trust Layer**. 

TrustLayer is a Retrieval-Augmented Generation (RAG) engine that doesn't just give you an answer—it mathematically proves its work. Every response is grounded in exact-sentence tracking, semantic confidence scoring, and strict hallucination guardrails. If the AI is guessing, the interface will literally stop and warn you. 

Built for Mini SIH 2026 by Team InclusionX.

---

## 🚀 The Differentiators (Why This Wins)

- 📍 **Citation Fingerprinting** — We don't just say "Source: Employee_Handbook.pdf". The UI pulls out the explicit, exact sentence from the source document that formed the answer.
- 🛡️ **Dynamic Hallucination Guard** — The backend computes a real-time Cosine Similarity score mapping the LLM's response retroactively against the vector database. If confidence drops below 35%, a red `⚠️ Hallucination Warning` badge locks into the chat bubble.
- ⚖️ **Multi-Doc Conflict Detector** — If you ask a question and the system synthesizes an answer using chunks from *two different documents* (which might have contradicting policies), the UI flags a semantic synthesis warning so you know to double-check the sources.
- 🧠 **Reasoning Telemetry** — Expand the debug panel on any response to see exactly how many document chunks the LangChain orchestrator fed into the context window. 

---

## 🏗️ Technical Architecture 

We built this stack to handle massive 100+ page enterprise documents without breaking a sweat. It uses batched chunk processing so memory overhead stays flat regardless of the size.

- **Frontend:** React (powered by Vite) + Tailwind CSS v3
- **Backend API:** Python FastAPI + Uvicorn 
- **LLM Engine:** Google Gemini API (`gemini-1.5-flash`)
- **Intelligence Layer:** `sentence-transformers` (`all-MiniLM-L6-v2`) via HuggingFace
- **Vector Core:** FAISS (Facebook AI Similarity Search) 
- **Data Ingestion:** `PyMuPDF` + `LangChain` RecursiveCharacterTextSplitter

---

## ⚙️ Running the Project

### 1. The Backend (Trust Engine)
```bash
cd backend
python -m venv venv
source venv/bin/activate

# Install the heavyweight intelligence libraries
pip install -r requirements.txt

# Start the API
uvicorn main:app --reload --port 8000
```
> **Security Note:** You must create a `.env` file in the `/backend` directory and add `GEMINI_API_KEY=your_key_here`. 

### 2. The Frontend (React UI)
```bash
cd frontend
npm install
npm run dev
```

---

## 💡 How We Handle 100+ Page Documents
The ingestion pipeline isn't a toy script. When you drop a massive PDF into TrustLayer:
1. `PyMuPDF` rapidly tokenizes and extracts the raw context mapped perfectly to page numbers.
2. `LangChain` slices the book into overlapping 500-character chunks (so sequential context isn't lost at the border of a split).
3. The sentence-transformers chunk the embeddings in batches (`batch_size=32`) so your RAM never spikes and crashes.
4. Everything is instantly written to the highly-optimized C++ FAISS index on disk.

It's clean, efficient, and bulletproof.

---
*Built with ❤️ by MrEGAMERZ / Team InclusionX.*
