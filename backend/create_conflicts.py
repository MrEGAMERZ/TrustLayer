import fitz

def create_pdf(filename, content):
    doc = fitz.open()
    page = doc.new_page()
    rect = fitz.Rect(50, 50, 550, 800)
    page.insert_textbox(rect, content, fontsize=12)
    doc.save(filename)
    print(f"{filename} created successfully.")

policy_2022 = """
ENTERPRISE POLICY V1.0
Effective Date: January 1, 2022

Section 1: General Terms
Employees are entitled to 18 days of vacation leave annually.
The standard notice period for termination is 30 days.
Working hours for full-time staff are 40 hours per week.
Annual bonus is set at 5 percent of salary.
"""

policy_2024 = """
ENTERPRISE POLICY V2.0 (REVISED)
Modified Date: March 15, 2024

Section 1: General Terms (Updated)
Vacation leave is 24 days annually for all eligible employees.
The standard notice period is now 60 days to ensure project continuity.
Working hours have been reduced to 35 hours per week to support life balance.
Annual bonus for all staff will be 8 percent of salary.
"""

create_pdf("policy_2022.pdf", policy_2022)
create_pdf("policy_2024.pdf", policy_2024)
