from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from services.ingestion import ingest_pdf
from services.retrieval import retrieve_chunks
from services.generation import generate_answer
from services.hallucination import detect_hallucination
import shutil, os

app = FastAPI(title="TrustLayer API")

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
    
    try:
        result = ingest_pdf(save_path, file.filename)
        return {"status": "success", "filename": file.filename, **result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/query")
async def query_documents(request: QueryRequest):
    try:
        chunks = retrieve_chunks(request.question, top_k=5)
        
        # Generate Answer
        answer = generate_answer(request.question, chunks)
        
        # Calculate Trust/Hallucination
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
    except Exception as e:
        return {
            "answer": f"Backend Error: {str(e)}\n\n(Did you remember to add your real GEMINI_API_KEY in the backend/.env file?)",
            "confidence": 0,
            "is_hallucinated": True,
            "warning": "Critical failure processing vector embeddings or contacting LLM API.",
            "citations": [],
            "chunks_used": 0
        }

@app.get("/documents")
def list_documents():
    data_path = "data/faiss_index/metadata.json"
    if not os.path.exists(data_path):
        return {"documents": []}
    
    with open(data_path, "r") as f:
        chunks = json.load(f)
        
    docs = {}
    for c in chunks:
        doc_name = c["doc"]
        docs[doc_name] = docs.get(doc_name, 0) + 1
        
    return {"documents": [{"name": k, "chunks": v} for k, v in docs.items()]}

@app.get("/health")
def health():
    return {"status": "TrustLayer is running 🚀"}
