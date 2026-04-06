from datetime import datetime

def score_document(doc_name: str, chunks: list, query_history: list = []) -> dict:
    """
    Score a document on 4 axes:
    1. Freshness — how recent is it?
    2. Density — how much information per page?
    3. Query hit rate — how often do its chunks get retrieved?
    4. Conflict rate — how often does it contradict other docs?
    """
    doc_chunks = [c for c in chunks if c["doc"] == doc_name]

    if not doc_chunks:
        return {"score": 0, "grade": "F", "breakdown": {}}

    # Freshness score (0-25)
    current_year = datetime.now().year
    doc_year = doc_chunks[0].get("year")
    if doc_year:
        age = current_year - doc_year
        freshness = max(0, 25 - (age * 3))
    else:
        freshness = 10  # unknown age, neutral

    # Density score (0-25)
    avg_chunk_len = sum(len(c["text"]) for c in doc_chunks) / len(doc_chunks)
    density = min(25, int((avg_chunk_len / 500) * 25))

    # Coverage score (0-25) — unique topics covered
    import re
    all_text = " ".join(c["text"] for c in doc_chunks)
    unique_sentences = len(set(re.split(r'[.!?]', all_text)))
    coverage = min(25, int((unique_sentences / 50) * 25))

    # Query relevance score (0-25) — placeholder, increments with usage
    relevance = 15  # default

    total = freshness + density + coverage + relevance
    grade = "A" if total >= 85 else "B" if total >= 70 else "C" if total >= 55 else "D" if total >= 40 else "F"

    return {
        "doc": doc_name,
        "total_score": total,
        "grade": grade,
        "breakdown": {
            "freshness": freshness,
            "density": density,
            "coverage": coverage,
            "relevance": relevance
        },
        "year": doc_year,
        "chunks": len(doc_chunks),
        "recommendation": (
            "Reliable source" if total >= 70
            else "Use with caution — document may be outdated or sparse"
            if total >= 40
            else "Low trust — consider uploading a newer version"
        )
    }
