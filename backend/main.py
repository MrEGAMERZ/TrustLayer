from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from services.ingestion import ingest_pdf
from services.retrieval import retrieve_chunks
from services.generation import generate_answer, generate_followups
from services.hallucination import detect_hallucination
from services.knowledge_graph import build_fact_map
from services.doc_trust import score_document
from services.verification import verify_answer_claims
from services.chart_builder import extract_chart_data
import shutil, os

app = FastAPI(title="TrustLayer API")

@app.on_event("startup")
def setup_data_dirs():
    os.makedirs("data/uploads", exist_ok=True)
    os.makedirs("data/faiss_index", exist_ok=True)
    print("Data directories verified.")

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

COMPARISON_KEYWORDS = ["compare", "difference", "vs", "versus", "differ", "contrast",
                       "both", "which is better", "how do they", "what changed",
                       "old vs", "new vs", "company a", "company b"]

def is_comparison_query(q: str) -> bool:
    ql = q.lower()
    return any(kw in ql for kw in COMPARISON_KEYWORDS)

@app.post("/query")
async def query_documents(request: QueryRequest):
    try:
        chunks = retrieve_chunks(request.question, top_k=8)
    except Exception:
        chunks = []

    # Load ALL chunks for chart building (need full doc coverage)
    all_chunks = []
    try:
        data_path = "data/faiss_index/metadata.json"
        if os.path.exists(data_path):
            with open(data_path) as f:
                all_chunks = json.load(f)
    except Exception:
        all_chunks = chunks

    try:
        answer, outdated_warning, intent_data, sub_questions, is_decomposed = generate_answer(request.question, chunks, request.history)
        
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
                "strict_refused": True,
                "intent": intent_data,
                "chart_data": None
            }

        # Generate Follow-up Questions
        followups = generate_followups(request.question, answer)

        # Detect Cross-Doc Conflicts
        conflict_detected = "[DATA_CONFLICT_DETECTED]" in answer
        display_answer = answer.replace("[DATA_CONFLICT_DETECTED]", "").strip()

        # Claim-level verification
        verification = verify_answer_claims(display_answer, chunks)

        # Chart artifact — generate when comparison query OR conflict detected
        chart_data = None
        if is_comparison_query(request.question) or conflict_detected:
            chart_data = extract_chart_data(all_chunks, display_answer)

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
                {"doc": c["doc"], "page": c["page"], "excerpt": c["text"][:250] + "..."}
                for c in chunks[:3]
            ],
            "chunks_used": len(chunks),
            "followups": followups,
            "strict_refused": False,
            "intent": intent_data,
            "verification": verification,
            "reasoning_steps": sub_questions if is_decomposed else None,
            "was_decomposed": is_decomposed,
            "chart_data": chart_data
        }
    except Exception as e:
        return {
            "answer": f"Backend Error: {str(e)}",
            "confidence": 0,
            "is_hallucinated": True,
            "is_conflict": False,
            "warning": "Critical failure.",
            "citations": [],
            "chunks_used": 0,
            "followups": [],
            "chart_data": None
        }

from fastapi.responses import StreamingResponse
import asyncio

@app.post("/query/stream")
async def query_stream(request: QueryRequest):
    try:
        chunks = retrieve_chunks(request.question, top_k=8)
    except Exception:
        chunks = []
        
    try:
        answer, outdated_warning, intent_data, sub_questions, is_decomposed = generate_answer(request.question, chunks, request.history)
        
        # Calculate Trust/Hallucination
        trust = detect_hallucination(answer, chunks)

        STRICT_MODE_THRESHOLD = 0.80

        if request.strict_mode and trust["confidence"] < STRICT_MODE_THRESHOLD:
            answer = f"⛔ SENTINEL REFUSAL — Query blocked in Strict Mode. Confidence ({round(trust['confidence']*100)}%) is below the enterprise threshold of 80%. This answer has been withheld to prevent decisions based on uncertain information."
            trust["is_hallucinated"] = False
            trust["warning"] = "Query refused by Strict Mode guardian."

        # Detect Cross-Doc Conflicts
        conflict_detected = "[DATA_CONFLICT_DETECTED]" in answer
        display_answer = answer.replace("[DATA_CONFLICT_DETECTED]", "").strip()

        followups = generate_followups(request.question, display_answer)

        # Claim-level verification
        verification = verify_answer_claims(display_answer, chunks)

        # Chart artifact for stream
        chart_data = None
        if is_comparison_query(request.question) or conflict_detected:
            try:
                data_path = "data/faiss_index/metadata.json"
                if os.path.exists(data_path):
                    with open(data_path) as f:
                        all_chunks = json.load(f)
                    chart_data = extract_chart_data(all_chunks, display_answer)
            except Exception:
                pass

        metadata = {
            "confidence": trust["confidence"],
            "is_hallucinated": trust["is_hallucinated"],
            "is_conflict": conflict_detected,
            "outdated_warning": outdated_warning,
            "warning": "🚨 CRITICAL CONFLICT DETECTED between document versions!" if conflict_detected else trust.get("warning"),
            "citations": [{"doc": c["doc"], "page": c["page"], "excerpt": c["text"][:250] + "..."} for c in chunks[:3]],
            "chunks_used": len(chunks),
            "followups": followups,
            "strict_refused": getattr(request, "strict_mode", False) and trust.get("confidence", 1) < STRICT_MODE_THRESHOLD,
            "intent": intent_data,
            "verification": verification,
            "reasoning_steps": sub_questions if is_decomposed else None,
            "was_decomposed": is_decomposed,
            "chart_data": chart_data
        }
        
        async def generate():
            yield "data: \u200b\n\n"
            await asyncio.sleep(0)
            words = display_answer.split(" ")
            for i, word in enumerate(words):
                if i < len(words) - 1:
                    yield f"data: {word} \n\n"
                else:
                    yield f"data: {word}\n\n"
                await asyncio.sleep(0.015)
            yield f"data: [DONE]{json.dumps(metadata)}\n\n"
        
        return StreamingResponse(generate(), media_type="text/event-stream")
    except Exception as e:
        async def err_stream():
            yield f"data: Backend Error: {str(e)}\n\n"
            yield f"data: [DONE]{json.dumps({'confidence':0,'citations':[],'is_hallucinated':True})}\n\n"
        return StreamingResponse(err_stream(), media_type="text/event-stream")

@app.get("/documents")
def list_documents():
    data_path = "data/faiss_index/metadata.json"
    if not os.path.exists(data_path):
        return {"documents": []}
    
    with open(data_path, "r") as f:
        chunks = json.load(f)

    docs = {}
    for c in chunks:
        if c["doc"] not in docs:
            docs[c["doc"]] = {"chunks": 0, "year": c.get("year")}
        docs[c["doc"]]["chunks"] += 1

    result = []
    for name in docs:
        trust = score_document(name, chunks)
        result.append({
            "name": name,
            "chunks": docs[name]["chunks"],
            "year": docs[name]["year"],
            "trust_score": trust["total_score"],
            "trust_grade": trust["grade"],
            "trust_breakdown": trust["breakdown"],
            "recommendation": trust["recommendation"]
        })

    return {"documents": result}

@app.get("/knowledge-graph")
def knowledge_graph():
    data_path = "data/faiss_index/metadata.json"
    if not os.path.exists(data_path):
        return {"conflicts": [], "conflict_count": 0}
    with open(data_path) as f:
        chunks = json.load(f)
    return build_fact_map(chunks)

@app.get("/health")
def health():
    return {"status": "TrustLayer is running 🚀"}
