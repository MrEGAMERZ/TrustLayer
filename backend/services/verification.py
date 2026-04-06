import re
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")

def verify_answer_claims(answer: str, chunks: list) -> dict:
    """
    Split answer into individual claims.
    Score each claim against the source chunks separately.
    Return per-claim verification with source attribution.
    """
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', answer.strip())
    sentences = [s for s in sentences if len(s) > 20]

    if not sentences or not chunks:
        return {"verified_claims": [], "unverified_claims": [], "verification_rate": 0}

    chunk_texts = [c["text"] for c in chunks]
    chunk_embeddings = model.encode(chunk_texts, convert_to_tensor=True)

    verified = []
    unverified = []

    for sentence in sentences:
        sent_emb = model.encode(sentence, convert_to_tensor=True)
        scores = util.cos_sim(sent_emb, chunk_embeddings)[0]
        best_score = float(scores.max())
        best_chunk_idx = int(scores.argmax())
        best_chunk = chunks[best_chunk_idx]

        claim_data = {
            "claim": sentence,
            "score": round(best_score, 3),
            "source_doc": best_chunk["doc"],
            "source_page": best_chunk["page"],
            "verified": best_score > 0.45
        }

        if best_score > 0.45:
            verified.append(claim_data)
        else:
            unverified.append(claim_data)

    total = len(sentences)
    rate = round(len(verified) / total, 2) if total > 0 else 0

    return {
        "verified_claims": verified,
        "unverified_claims": unverified,
        "verification_rate": rate,
        "total_claims": total
    }
