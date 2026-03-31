import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter
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
    
    # We will conditionally write to faiss index
    # Note: if there's already an index, we should merge or load it, but for Day 1 
    # we'll use the holy grail snippet which overwrites or adds depending on how we want it
    # the Holy Grail snippet overwrites the index per file (for hackathon MVP).
    # MVP approach from snippet:
    faiss.write_index(index, "data/faiss_index/index.faiss")
    with open("data/faiss_index/metadata.json", "w") as f:
        json.dump(final_chunks, f)

    return {"chunks_created": len(final_chunks)}
