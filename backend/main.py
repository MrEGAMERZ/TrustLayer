from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from services.ingestion import ingest_pdf
from services.retrieval import retrieve_chunks
from services.generation import generate_answer, generate_followups
from services.hallucination import detect_hallucination
import shutil, os

app = FastAPI(title="TrustLayer API")

@app.on_event("startup")
def clear_data_on_startup():
    if os.path.exists("data"):
        shutil.rmtree("data")
        print("Data directory cleared on startup to ensure fresh state.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    history: list = []  # Added for conversation memory
    strict_mode: bool = False

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
        
        # Generate Answer with Memory
        answer, outdated_warning = generate_answer(request.question, chunks, request.history)
        
        # Calculate Trust/Hallucination
        trust = detect_hallucination(answer, chunks)

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

        # Generate Follow-up Questions
        followups = generate_followups(request.question, answer)

        # Detect Cross-Doc Conflicts (Sentinel V2 feature)
        conflict_detected = "[DATA_CONFLICT_DETECTED]" in answer
        display_answer = answer.replace("[DATA_CONFLICT_DETECTED]", "").strip()

        return {
            "answer": display_answer,
            "confidence": trust["confidence"],
            "is_hallucinated": trust["is_hallucinated"],
            "is_conflict": conflict_detected,
            "outdated_warning": outdated_warning,
            "warning": (
                "🚨 CRITICAL CONFLICT DETECTED between document versions!"
                if conflict_detected else trust["warning"]
            ),
            "citations": [
                {
                    "doc": c["doc"],
                    "page": c["page"],
                    "excerpt": c["text"][:250] + "..."
                }
                for c in chunks[:3]
            ],
            "chunks_used": len(chunks),
            "followups": followups,
            "strict_refused": False
        }
    except Exception as e:
        return {
            "answer": f"Backend Error: {str(e)}\n\n(Did you remember to add your real GEMINI_API_KEY in the backend/.env file?)",
            "confidence": 0,
            "is_hallucinated": True,
            "is_conflict": False,
            "warning": "Critical failure processing vector embeddings or contacting LLM API.",
            "citations": [],
            "chunks_used": 0,
            "followups": []
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
        if doc_name not in docs:
            docs[doc_name] = {"chunks": 0, "year": c.get("year")}
        docs[doc_name]["chunks"] += 1
        
    return {"documents": [{"name": k, "chunks": v["chunks"], "year": v["year"]} for k, v in docs.items()]}

@app.get("/health")
def health():
    return {"status": "TrustLayer is running 🚀"}
