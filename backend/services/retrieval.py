import faiss, json, re
import numpy as np
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi

model = SentenceTransformer("all-MiniLM-L6-v2")

def _tokenize(text: str) -> list[str]:
    """Simple whitespace + punctuation tokenizer for BM25."""
    return re.findall(r'\w+', text.lower())

def _reciprocal_rank_fusion(rankings: list[list[int]], k: int = 60) -> list[tuple[int, float]]:
    """
    Reciprocal Rank Fusion (RRF) — merges multiple ranked lists into one.
    Each ranking is a list of document indices ordered by relevance.
    k=60 is the standard smoothing constant from the original RRF paper.
    Returns: list of (doc_index, rrf_score) sorted by score descending.
    """
    scores = {}
    for ranking in rankings:
        for rank, doc_idx in enumerate(ranking):
            if doc_idx not in scores:
                scores[doc_idx] = 0.0
            scores[doc_idx] += 1.0 / (k + rank + 1)
    
    # Sort by RRF score descending
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_scores

def retrieve_chunks(query: str, top_k: int = 5):
    """
    Hybrid Search: Combines FAISS (semantic/vector) + BM25 (keyword/exact match)
    using Reciprocal Rank Fusion for production-grade retrieval.
    """
    index = faiss.read_index("data/faiss_index/index.faiss")
    with open("data/faiss_index/metadata.json") as f:
        metadata = json.load(f)

    # ── 1. FAISS Vector Search (Semantic) ──
    query_embedding = model.encode([query], convert_to_numpy=True)
    # Retrieve more candidates than needed so RRF has a good pool to work with
    faiss_k = min(top_k * 4, len(metadata))
    distances, indices = index.search(query_embedding, faiss_k)
    
    # Build the FAISS ranking (list of valid doc indices, ordered by relevance)
    faiss_ranking = [int(idx) for idx in indices[0] if idx != -1]

    # ── 2. BM25 Keyword Search (Exact Match) ──
    corpus_tokens = [_tokenize(chunk["text"]) for chunk in metadata]
    bm25 = BM25Okapi(corpus_tokens)
    
    query_tokens = _tokenize(query)
    bm25_scores = bm25.get_scores(query_tokens)
    
    # Build the BM25 ranking (top candidates sorted by BM25 score)
    bm25_top_indices = np.argsort(bm25_scores)[::-1][:faiss_k].tolist()
    bm25_ranking = [idx for idx in bm25_top_indices if bm25_scores[idx] > 0]

    # ── 3. Reciprocal Rank Fusion ──
    fused = _reciprocal_rank_fusion([faiss_ranking, bm25_ranking])

    # ── 4. Build final results ──
    results = []
    for doc_idx, rrf_score in fused[:top_k]:
        if doc_idx < len(metadata):
            chunk = metadata[doc_idx]
            results.append({
                "text": chunk["text"],
                "page": chunk["page"],
                "doc": chunk["doc"],
                "year": chunk.get("year"),
                "rrf_score": round(rrf_score, 5),
            })

    return results
