import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load env variables if present
load_dotenv()

# We expect GEMINI_API_KEY to be in the environment
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    
llm = genai.GenerativeModel("gemini-1.5-flash")

def generate_answer(query: str, chunks: list) -> str:
    # Construct high-density context string with explicit indexing
    context_blocks = []
    for i, c in enumerate(chunks):
        context_blocks.append(f"--- DATA NODE {i+1} [DOC: {c['doc']}, PAGE: {c['page']}] ---\n{c['text']}")
    
    context = "\n\n".join(context_blocks)

    # The 'Sentinel' Prompt: Deeply analytical, zero-hallucination constraint
    prompt = f"""SYSTEM ROLE: You are the TrustLayer Unified Intelligence Sentinel. 
Your core mission is to provide 100% mathematically grounded answers extracted exclusively from the DATA NODES provided below.

INSTRUCTIONS:
1. ABSOLUTE GROUNDING: If the query cannot be answered with 100% certainty using only the provided DATA NODES, state: "I could not find definitive information in the current enterprise context."
2. CITATION PROTOCOL: Every factual claim must be immediately followed by its source in square brackets, e.g., "The quarterly revenue grew by 12% [Source: financial_report.pdf, Page 4]."
3. CONFLICT RESOLUTION: If different DATA NODES provide conflicting information, highlight the discrepancy explicitly to the user.
4. TONE: Professional, concise, and analytical. Avoid conversational fillers like "I am happy to help" or "According to the documents."

AVAILABLE ENTERPRISE CONTEXT (DATA NODES):
{context}

USER QUERY: {query}

TRUSTLAYER SENTINAL ANALYSIS & RESPONSE:"""

    response = llm.generate_content(prompt)
    return response.text.strip()
