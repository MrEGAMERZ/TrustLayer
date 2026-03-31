from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")

def compute_confidence(answer: str, chunks: list) -> float:
    """
    Returns 0.0 to 1.0 — how grounded the answer is in retrieved chunks.
    Displayed as 0-100% in the UI.
    """
    if not answer or not chunks:
        return 0.0

    answer_emb = model.encode(answer, convert_to_tensor=True)
    chunk_texts = [c["text"] for c in chunks]
    chunk_embs = model.encode(chunk_texts, convert_to_tensor=True)

    similarities = util.cos_sim(answer_emb, chunk_embs)
    return round(float(similarities.max()), 3)
