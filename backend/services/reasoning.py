import json
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def decompose_query(query: str) -> list:
    """
    Break a complex query into simple sub-questions.
    Returns list of sub-questions or [query] if simple.
    """
    complexity_indicators = [
        "and", "also", "additionally", "furthermore",
        "compare", "difference", "both", "all", "every",
        "first", "then", "after", "before", "if"
    ]

    word_count = len(query.split())
    indicator_count = sum(1 for w in complexity_indicators if w in query.lower())

    # Simple query — don't decompose
    if word_count < 12 and indicator_count < 2:
        return [query]

    prompt = f"""Break this complex question into 2-3 simple sub-questions that together answer the original.
Return ONLY a JSON array of strings. No markdown. No explanation.
If the question is already simple, return ["original question"].

Question: {query}

JSON array:"""

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            max_tokens=200
        )
        text = response.choices[0].message.content.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        sub_questions = json.loads(text)
        if len(sub_questions) <= 1:
            return [query]
        return sub_questions[:3]
    except Exception:
        return [query]

def is_complex_query(query: str) -> bool:
    return len(decompose_query(query)) > 1
