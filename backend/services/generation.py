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
    context = "\n\n".join([
        f"[Source: {c['doc']}, Page {c['page']}]\n{c['text']}"
        for c in chunks
    ])

    prompt = f"""You are an enterprise knowledge assistant.

Answer the user's question ONLY using the provided context below.
If the answer is not in the context, say exactly:
"I could not find this information in the uploaded documents."
Always mention which document and page your answer comes from.

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""

    response = llm.generate_content(prompt)
    return response.text
