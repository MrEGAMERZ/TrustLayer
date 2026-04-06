import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load env variables if present
load_dotenv()

# Build client
api_key = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

def detect_numeric_conflicts(chunks: list) -> str | None:
    import re
    if len(chunks) < 2:
        return None

    doc_numbers = {}
    for c in chunks:
        nums = set(re.findall(r'\b\d+\b', c["text"]))
        doc = c["doc"]
        if doc not in doc_numbers:
            doc_numbers[doc] = set()
        doc_numbers[doc].update(nums)

    if len(doc_numbers) < 2:
        return None

    docs = list(doc_numbers.keys())
    for i in range(len(docs)):
        for j in range(i + 1, len(docs)):
            diff_a = doc_numbers[docs[i]] - doc_numbers[docs[j]]
            diff_b = doc_numbers[docs[j]] - doc_numbers[docs[i]]
            if diff_a and diff_b:
                return (
                    f"Numeric conflict detected: '{docs[i]}' and '{docs[j]}' "
                    f"contain different figures on the same topic. "
                    f"Verify both sources before acting."
                )
    return None

SYSTEM_PROMPT = """You are SENTINEL — TrustLayer's enterprise knowledge engine.

You operate in two modes. Detect which mode applies and respond accordingly.

MODE A — FACTUAL LOOKUP
Triggered by: questions asking for specific facts, numbers, dates, rules, 
clauses, policies. Keywords: "what is", "how many", "when", "who", "does", "can I"

Rules for Mode A:
- Answer in 2-4 sentences maximum
- Cite inline: [DocName, p.X] after every factual claim
- Quote exact numbers from the document — never round or paraphrase
- If not found: say exactly "This information is not in your uploaded documents."

MODE B — DOCUMENT TASK  
Triggered by: requests to DO something with the document content.
Keywords: "summarize", "draft", "write", "compare", "explain", "simplify", 
"create", "list all", "what are the differences", "help me understand"

Rules for Mode B:
- You CAN generate, rewrite, draft, and summarize
- ONLY use information from the provided document context
- Do not invent facts, names, numbers, or policies
- End your response with: "Based on: [list doc names used]"
- Keep it practical and actionable for an employee

UNIVERSAL RULES (both modes):
- Never start with "Great question", "Certainly", "Based on the context provided"
- Never say "As an AI"
- If asked something completely unrelated to the documents with no document 
  context available, respond: "I can only help with questions about your 
  uploaded documents. Please upload a relevant file first."
- Be direct. Employees are busy.
- Professional but human tone."""

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
    numeric_conflict = detect_numeric_conflicts(chunks)
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

    # The 'Sentinel 3.0' Prompt: Two-Mode Architecture
    prompt = f"""{SYSTEM_PROMPT}

AVAILABLE ENTERPRISE CONTEXT (DATA NODES):
{context}
{history_text}
USER QUERY: {query}

SENTINEL RESPONSE:"""

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2
        )
        answer_text = response.choices[0].message.content.strip()
        if numeric_conflict and "[DATA_CONFLICT_DETECTED]" not in answer_text:
            answer_text = "[DATA_CONFLICT_DETECTED] " + answer_text
        return answer_text, outdated_warning
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
