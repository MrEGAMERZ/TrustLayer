import fitz  # PyMuPDF
import sys

def extract_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

if __name__ == "__main__":
    pdf_path = r"C:\Users\harsha vardhan\OneDrive\Desktop\Developer\TrustLayer\idea\Business-Conduct-Policy.pdf"
    try:
        content = extract_text(pdf_path)
        print(content[:5000]) # Print first 5000 chars to summarize
    except Exception as e:
        print(f"Error: {e}")
