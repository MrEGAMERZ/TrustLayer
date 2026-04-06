import fitz

doc = fitz.open()
page = doc.new_page()
text = """
INCLUSIONX ENTERPRISE POLICY
Effective Date: April 1, 2026

Section 1: General Guidelines
This document states the general guidelines for all employees. 

Section 2: Notice Period
The notice period is 30 days as stated in Section 4.2 of the employment contract.
"""
rect = fitz.Rect(50, 50, 500, 800)
page.insert_textbox(rect, text, fontsize=12)
doc.save("test.pdf")
print("test.pdf created successfully.")
