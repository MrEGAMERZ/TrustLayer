from fpdf import FPDF
import os

os.makedirs("test_data", exist_ok=True)

# Doc 1: Version 1.0 (Standard Policy)
pdf1 = FPDF()
pdf1.add_page()
pdf1.set_font("Arial", size=12)
pdf1.cell(200, 10, txt="Enterprise Policy V1.0", ln=True, align='C')
pdf1.ln(10)
pdf1.multi_cell(0, 10, txt="The quarterly budget for innovation is capped at $500,000 per fiscal year. All requests must be submitted by the 15th of the month. The trust layer version is alpha-01.")
pdf1.output("test_data/policy_v1.pdf")

# Doc 2: Version 2.0 (Conflicting Policy)
pdf2 = FPDF()
pdf2.add_page()
pdf2.set_font("Arial", size=12)
pdf2.cell(200, 10, txt="Enterprise Policy V2.0 (UPGRADE)", ln=True, align='C')
pdf2.ln(10)
pdf2.multi_cell(0, 10, txt="As of Q3, the innovation budget has been REVISED to $1,200,000 to support AI expansion. The trust layer version is now sentinel-beta. Conflict detection is active.")
pdf2.output("test_data/policy_v2.pdf")

print("Test PDFs created in /Volumes/MINI 2/Developer/MSIH/IncusionX/test_data/")
