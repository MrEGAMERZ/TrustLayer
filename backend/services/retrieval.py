import faiss, json
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def retrieve_chunks(query: str, top_k: int = 5):
    index = faiss.read_index("data/faiss_index/index.faiss")
    with open("data/faiss_index/metadata.json") as f:
        metadata = json.load(f)

    query_embedding = model.encode([query], convert_to_numpy=True)
    distances, indices = index.search(query_embedding, top_k)

    results = []
    # indices is a 2D array, we only submitted one query so we look at indices[0]
    for i, idx in enumerate(indices[0]):
        # Handle cases where there are fewer chunks than top_k (-1 means not found)
        if idx == -1:
            break
        results.append({
            "text": metadata[idx]["text"],
            "page": metadata[idx]["page"],
            "doc": metadata[idx]["doc"],
            "distance": float(distances[0][i])
        })

    return results
