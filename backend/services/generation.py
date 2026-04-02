import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load env variables if present
load_dotenv()

# We expect GEMINI_API_KEY to be in the environment
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    
llm = genai.GenerativeModel("gemini-2.0-flash")

def generate_answer(query: str, chunks: list) -> str:
    # Construct high-density context string with explicit indexing
    context_blocks = []
    for i, c in enumerate(chunks):
        context_blocks.append(f"--- DATA NODE {i+1} [DOC: {c['doc']}, PAGE: {c['page']}] ---\n{c['text']}")
    
    context = "\n\n".join(context_blocks)

    # The 'Sentinel 2.0' Prompt: Cross-Node Validation & Conflict Detection
    prompt = f"""SYSTEM ROLE: You are the TrustLayer Unified Intelligence Sentinel V2.0. 
Your Core Mission: Perform a high-integrity cross-validation of the DATA NODES below to answer the query.

CRITICAL INSTRUCTIONS:
1. CROSS-NODE ANALYSIS: Before answering, check if DATA NODE A contradicts DATA NODE B. (e.g. Doc 1 says "Version 2.0" but Doc 2 says "Version 3.1").
2. CONFLICT DISCLOSURE: If a contradiction exists, you MUST start your response with the tag [DATA_CONFLICT_DETECTED] and explicitly describe the discrepancy.
3. ABSOLUTE GROUNDING: If the query cannot be answered with 100% certainty from the DATA NODES, state: "I could not find definitive information in the current enterprise context."
4. CITATION PROTOCOL: Every factual claim must be immediately followed by its source in square brackets, e.g. [Source: report.pdf, Page 4].
5. TONE: Professional, analytical, and risk-averse.

AVAILABLE ENTERPRISE CONTEXT (DATA NODES):
{context}

USER QUERY: {query}

TRUSTLAYER SENTINAL ANALYSIS & RESPONSE:"""

    response = llm.generate_content(prompt)
    return response.text.strip()
