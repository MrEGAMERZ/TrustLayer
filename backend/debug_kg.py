import re
from collections import defaultdict

def build_fact_map(chunks: list) -> dict:
    fact_pattern = re.compile(
        r'([A-Za-z\s]{3,30})\s+(?:is|are|was|shall be|will be|must be)?\s*'
        r'(\d+(?:\.\d+)?)\s*'
        r'(days?|months?|years?|hours?|percent|%|rupees?|lakhs?|crores?)?',
        re.IGNORECASE
    )

    doc_facts = defaultdict(list)

    for chunk in chunks:
        matches = fact_pattern.findall(chunk["text"])
        print(f"Checking chunk from {chunk['doc']}: {matches}")
        for subject, value, unit in matches:
            subject = subject.strip().lower()
            if len(subject) > 3:
                doc_facts[chunk["doc"]].append({
                    "subject": subject,
                    "value": float(value),
                    "unit": unit.lower().strip(),
                    "page": chunk.get("page", 1),
                    "year": chunk.get("year")
                })
    return doc_facts

chunks = [
    {"text": "ENTERPRISE POLICY V1.0\nEffective Date: January 1, 2022\nSection 1: General Terms\nEmployees are entitled to 18 days of vacation leave annually.\nThe standard notice period for termination is 30 days.\nWorking hours for full-time staff are 40 hours per week.\nAnnual bonus is set at 5 percent of salary.", "page": 1, "doc": "policy_2022.pdf", "year": None},
    {"text": "ENTERPRISE POLICY V2.0 (REVISED)\nModified Date: March 15, 2024\nSection 1: General Terms (Updated)\nVacation leave is 24 days annually for all eligible employees.\nThe standard notice period is now 60 days to ensure project continuity.\nWorking hours have been reduced to 35 hours per week to support life balance.\nAnnual bonus for all staff will be 8 percent of salary.", "page": 1, "doc": "policy_2024.pdf", "year": None}
]

facts = build_fact_map(chunks)
print("\nExtracted Facts:")
for doc, items in facts.items():
    print(f"{doc}: {items}")
