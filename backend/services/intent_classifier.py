INTENT_PROFILES = {
    "fact_lookup": {
        "keywords": ["what is", "how many", "when is", "who is", "what are", "how much", "what does"],
        "response_format": "Direct answer in 1-2 sentences. Single citation.",
        "tone": "Precise and brief."
    },
    "process_understanding": {
        "keywords": ["how do i", "how to", "what are the steps", "process for", "procedure", "how does"],
        "response_format": "Numbered steps. Cite each step.",
        "tone": "Clear and sequential."
    },
    "compliance_check": {
        "keywords": ["am i allowed", "can i", "is it allowed", "am i eligible", "do i qualify", "is this compliant", "against policy"],
        "response_format": "Yes/No first. Then cite the exact policy clause. Flag exceptions.",
        "tone": "Definitive. Risk-aware."
    },
    "comparison": {
        "keywords": ["difference between", "compare", "vs", "versus", "which is better", "old vs new", "v1 vs v2"],
        "response_format": "Side-by-side comparison table format. Cite both sources.",
        "tone": "Balanced and factual."
    },
    "document_task": {
        "keywords": ["summarize", "draft", "write", "create", "generate", "simplify", "explain like"],
        "response_format": "Generated output based only on document content.",
        "tone": "Practical and actionable."
    }
}

def classify_intent(query: str) -> dict:
    query_lower = query.lower()
    scores = {}

    for intent, profile in INTENT_PROFILES.items():
        score = sum(1 for kw in profile["keywords"] if kw in query_lower)
        scores[intent] = score

    best_intent = max(scores, key=scores.get)

    if scores[best_intent] == 0:
        best_intent = "fact_lookup"

    return {
        "intent": best_intent,
        "response_format": INTENT_PROFILES[best_intent]["response_format"],
        "tone": INTENT_PROFILES[best_intent]["tone"],
        "confidence": min(scores[best_intent] / 2, 1.0)
    }
