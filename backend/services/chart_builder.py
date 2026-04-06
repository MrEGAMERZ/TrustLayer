import re
from collections import defaultdict

# Colour palette per document (cycles if >8 docs)
DOC_COLORS = ["#22d3ee", "#a78bfa", "#4ade80", "#fb923c", "#f472b6", "#facc15", "#60a5fa", "#f87171"]

def extract_chart_data(chunks: list, filter_text: str = "") -> dict | None:
    """
    Extract numeric metrics per document and produce chart-ready data.
    """
    fact_pattern = re.compile(
        r'([A-Za-z][A-Za-z\s]{2,28})\s+(?:is|are|was|shall be|will be|must be|have been reduced to|are entitled to)?\s*'
        r'(\d+(?:\.\d+)?)\s*'
        r'(days?|months?|years?|hours?|percent|%|rupees?|lakhs?|crores?)',
        re.IGNORECASE
    )

    NOISE = {"the", "standard", "annual", "set", "at", "for", "now", "been",
             "is", "of", "to", "are", "shall", "be", "must", "all", "full",
             "eligible", "time", "staff", "employees", "per", "week"}

    def clean(s: str) -> str:
        words = [w for w in s.strip().lower().split() if w not in NOISE and len(w) > 2]
        return " ".join(words[:4])

    doc_chunks = defaultdict(list)
    for c in chunks:
        doc_chunks[c["doc"]].append(c)

    if len(doc_chunks) < 2:
        return None

    doc_metrics = {}
    for doc, doc_chunk_list in doc_chunks.items():
        metrics = {}
        for chunk in doc_chunk_list:
            for subject, value, unit in fact_pattern.findall(chunk["text"]):
                label = clean(subject)
                if len(label) > 2:
                    metrics[label] = { "value": float(value), "unit": unit.strip().lower() }
        if metrics:
            doc_metrics[doc] = metrics

    if len(doc_metrics) < 2:
        return None

    # Step: Find topics relevant to the current conversation
    all_topics = None
    for metrics in doc_metrics.values():
        topic_set = set(metrics.keys())
        all_topics = topic_set if all_topics is None else all_topics.intersection(topic_set)

    if not all_topics:
        return None

    # Filter: ONLY keep topics that are actually mentioned in the query or answer
    # This prevents the "Bonus" chart appearing when you're talking about "Vacation"
    filter_context = filter_text.lower()
    relevant_topics = []
    for topic in all_topics:
        # Check if any word in the topic appears in the filter context
        topic_words = set(topic.split())
        if any(word in filter_context for word in topic_words) or not filter_text:
            relevant_topics.append(topic)
    
    if not relevant_topics:
        return None

    # datasets build...
    datasets = []
    for i, (doc, metrics) in enumerate(doc_metrics.items()):
        color = DOC_COLORS[i % len(DOC_COLORS)]
        values = {}
        for topic in relevant_topics:
            if topic in metrics:
                values[topic] = metrics[topic]
        if values:
            datasets.append({ "doc": doc, "color": color, "values": values })

    if len(datasets) < 2:
        return None

    return {
        "type": "bar_comparison",
        "title": "Topic Comparison Data",
        "topics": relevant_topics,
        "datasets": datasets
    }
