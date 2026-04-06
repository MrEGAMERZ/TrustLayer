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

    doc_facts = defaultdict(list)

    for chunk in chunks:
        matches = fact_pattern.findall(chunk["text"])
        for subject, value, unit in matches:
            subject = subject.strip().lower()
            if len(subject) > 3:
                doc_facts[chunk["doc"]].append({
                    "subject": subject,
                    "value": float(value),
                    "unit": unit.strip(),
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
                    # Same subject, different value
                    if (fa["subject"] == fb["subject"] and
                            fa["value"] != fb["value"] and
                            fa["unit"] == fb["unit"]):
                        conflicts.append({
                            "subject": fa["subject"],
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
