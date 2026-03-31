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

@app.get("/health")
def health():
    return {"status": "KnowledgeOS is running 🚀"}
