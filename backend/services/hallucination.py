from services.confidence import compute_confidence
import re

HALLUCINATION_THRESHOLD = 0.35

def detect_hallucination(answer: str, chunks: list) -> dict:
    score = compute_confidence(answer, chunks)

    if "I cannot find" in answer or "not available in your uploaded" in answer:
        return {
            "is_hallucinated": False,
            "confidence": score,
            "warning": None,
            "flag_reason": None
        }

    # Check 1: low cosine similarity
    cosine_flagged = score < HALLUCINATION_THRESHOLD

    # Check 2: numbers in answer not present in any chunk
    answer_numbers = set(re.findall(r'\b\d+\b', answer))
    chunk_text = " ".join([c["text"] for c in chunks])
    chunk_numbers = set(re.findall(r'\b\d+\b', chunk_text))
    invented_numbers = answer_numbers - chunk_numbers
    number_flagged = len(invented_numbers) > 0

    # Check 3: uncertainty language
    uncertainty_phrases = [
        "i think", "i believe", "probably", "might be",
        "i'm not sure", "approximately", "around", "roughly"
    ]
    phrase_flagged = any(p in answer.lower() for p in uncertainty_phrases)

    flagged = cosine_flagged or number_flagged or phrase_flagged

    if number_flagged:
        reason = f"Answer contains figures not found in source documents: {', '.join(list(invented_numbers)[:3])}"
    elif phrase_flagged:
        reason = "Answer uses uncertain language. Verify before acting on this."
    elif cosine_flagged:
        reason = "Low semantic overlap with source material. Answer may not be fully grounded."
    else:
        reason = None

    return {
        "is_hallucinated": flagged,
        "confidence": score,
        "warning": reason,
        "flag_reason": "number" if number_flagged else "phrase" if phrase_flagged else "cosine" if cosine_flagged else None
    }
