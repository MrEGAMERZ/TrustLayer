import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json, os

model = SentenceTransformer("all-MiniLM-L6-v2")

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

def ingest_pdf(file_path: str, doc_name: str):
    # Step 1: Extract text with page numbers
    try:
        doc = fitz.open(file_path)
    except Exception as e:
        # Fallback or strict error message if format isn't supported by fitz
        raise ValueError(f"Could not parse document '{doc_name}'. Ensure it's a valid PDF/TXT. Error: {str(e)}")

    full_text = " ".join([page.get_text() for page in doc])
    doc_year = extract_document_date(full_text)

    chunks_with_meta = []

    for page_num, page in enumerate(doc):
        text = page.get_text()
        if not text.strip():
            continue
            
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
                "doc": item["doc"],
                "year": doc_year
            })

    if not final_chunks:
        return {"chunks_created": 0}

    # Step 3: Embed all chunks in batches to handle 100+ page documents without blowing up RAM
    texts = [c["text"] for c in final_chunks]
    embeddings = model.encode(texts, convert_to_numpy=True, batch_size=32, show_progress_bar=False)

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

    return {"chunks_created": len(final_chunks)}
