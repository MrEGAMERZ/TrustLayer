import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load env variables if present
load_dotenv()

# Build client
api_key = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

def generate_answer(query: str, chunks: list, history: list = []):
    if not client:
        return "Backend Error: GROQ_API_KEY is missing! Did you forget to add it to .env?", None
        
    # Construct high-density context string with explicit indexing
    context_blocks = []
    doc_years = {}

    for i, c in enumerate(chunks):
        year_str = f", Year: {c['year']}" if c.get('year') else ""
        context_blocks.append(
            f"--- DATA NODE {i+1} [DOC: {c['doc']}, PAGE: {c['page']}{year_str}] ---\n{c['text']}"
        )
        if c.get('year'):
            doc_years[c['doc']] = c['year']

    context = "\n\n".join(context_blocks)

    # Check if multiple docs have different years on the same topic
    outdated_warning = None
    if len(doc_years) >= 2:
        years = list(doc_years.items())
        years.sort(key=lambda x: x[1])
        oldest_doc, oldest_year = years[0]
        newest_doc, newest_year = years[-1]
        if oldest_year != newest_year:
            outdated_warning = f"OUTDATED SOURCE WARNING: '{oldest_doc}' ({oldest_year}) may be superseded by '{newest_doc}' ({newest_year}). Answer is weighted toward the newer document."

    history_text = ""
    if history:
        history_text = "\nCONVERSATION HISTORY (PAST 4 TURNS):\n"
        for h in history[-4:]:
            history_text += f"{h['role'].upper()}: {h['content']}\n"
        history_text += "\n"

    # The 'Sentinel 2.0' Prompt: Conversational but Grounded
    prompt = f"""SYSTEM ROLE: You are TrustLayer, an advanced Enterprise AI Assistant.
Your goal is to answer the user's query DIRECTLY and CONCISELY using ONLY the provided DATA NODES.

CRITICAL RULES:
1. NO THINKING OUT LOUD: Never explain your internal process. Do NOT say "I must first cross-validate" or "I am reviewing the data nodes." Just give the direct answer immediately!
2. ANSWER DIRECTLY: Provide a clear, conversational, and direct answer. Use bullet points or bold text to make it easy to read.
3. CONFLICTS: Only if you spot a clear contradiction between document versions, prepend your answer with [DATA_CONFLICT_DETECTED] and briefly note the conflict. Otherwise, never mention conflicts or cross-validation.
4. GROUNDING: If the answer is completely missing from the DATA NODES, simply say: "I cannot find the answer to this in the uploaded documents." Do not try to guess.
5. CITATIONS: When you state a fact, cite it immediately like this: [DocTitle, Page X].
6. TONE: Professional, conversational, and highly efficient. Act like a helpful human expert.

AVAILABLE ENTERPRISE CONTEXT (DATA NODES):
{context}
{history_text}
USER QUERY: {query}

TRUSTLAYER RESPONSE (Direct & Conversational):"""

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2
        )
        return response.choices[0].message.content.strip(), outdated_warning
    except Exception as e:
        return f"Backend Error: {str(e)}", None

def generate_followups(query: str, answer: str) -> list:
    if not client:
        return []
        
    prompt = f"""Based on this Q&A, suggest exactly 3 short follow-up questions a user might ask next.
Return ONLY a JSON array of 3 strings. Keep each question under 10 words. Do not include markdown formatting or backticks.

Q: {query}
A: {answer[:300]}

Follow-ups:"""
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3
        )
        text = response.choices[0].message.content.strip()
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        return json.loads(text.strip())[:3]
    except Exception as e:
        print("Failed to parse followups:", e)
        return []
