import re
from collections import defaultdict

def build_fact_map(chunks: list) -> dict:
    """
    Extract key facts (subject-number pairs) from each doc
    and map contradictions between them.
    """
    fact_pattern = re.compile(
        r'([A-Za-z\s]{3,30})\s+(?:is|are|was|shall be|will be|must be)?\s*'
        r'(\d+(?:\.\d+)?)\s*'
        r'(days?|months?|years?|hours?|percent|%|rupees?|lakhs?|crores?)?',
        re.IGNORECASE
    )

    def clean_subject(s: str) -> str:
        # Remove common "noise" words to improve matching
        noise = ["the", "standard", "annual", "set", "at", "for", "now", "been", "is", "of", "to", "now", "are", "shall", "be", "must"]
        words = [w for w in s.split() if w not in noise and len(w) > 2]
        return " ".join(words)

    doc_facts = defaultdict(list)

    for chunk in chunks:
        matches = fact_pattern.findall(chunk["text"])
        for subject, value, unit in matches:
            subj_clean = clean_subject(subject.strip().lower())
            if len(subj_clean) > 2:
                doc_facts[chunk["doc"]].append({
                    "subject": subj_clean,
                    "original_subject": subject.strip(),
                    "value": float(value),
                    "unit": unit.strip().lower(),
                    "page": chunk["page"],
                    "doc": chunk["doc"],
                    "year": chunk.get("year")
                })

    # Find contradictions
    conflicts = []
    docs = list(doc_facts.keys())

    for i in range(len(docs)):
        for j in range(i + 1, len(docs)):
            facts_a = doc_facts[docs[i]]
            facts_b = doc_facts[docs[j]]

            for fa in facts_a:
                for fb in facts_b:
                    # Fuzzy match: Subject word overlap
                    # If they share at least 2 key words (or 1 if it's the only word), they match
                    words_a = set(fa["subject"].split())
                    words_b = set(fb["subject"].split())
                    common = words_a.intersection(words_b)
                    
                    if (len(common) >= min(2, len(words_a), len(words_b)) and 
                            fa["value"] != fb["value"] and 
                            fa["unit"] == fb["unit"]):
                        
                        conflicts.append({
                            "subject": " ".join(sorted(common)), # Show common keywords as subject
                            "original_a": fa["original_subject"],
                            "original_b": fb["original_subject"],
                            "doc_a": docs[i],
                            "value_a": fa["value"],
                            "unit_a": fa["unit"],
                            "page_a": fa["page"],
                            "year_a": fa.get("year"),
                            "doc_b": docs[j],
                            "value_b": fb["value"],
                            "unit_b": fb["unit"],
                            "page_b": fb["page"],
                            "year_b": fb.get("year"),
                            "severity": "high" if abs(fa["value"] - fb["value"]) / max(fa["value"], 1) > 0.2 else "low"
                        })

    return {
        "doc_facts": {k: v for k, v in doc_facts.items()},
        "conflicts": conflicts,
        "conflict_count": len(conflicts)
    }
