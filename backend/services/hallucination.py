from services.confidence import compute_confidence

HALLUCINATION_THRESHOLD = 0.35

def detect_hallucination(answer: str, chunks: list) -> dict:
    score = compute_confidence(answer, chunks)
    
    # If answer contains the fallback string, don't flag as hallucination but keep score low
    if "I could not find" in answer:
        return {
            "is_hallucinated": False,
            "confidence": 0.0,
            "warning": None
        }

    flagged = score < HALLUCINATION_THRESHOLD

    return {
        "is_hallucinated": flagged,
        "confidence": score,
        "warning": (
            "⚠️ This answer may not be fully supported by your documents."
            if flagged else None
        )
    }
