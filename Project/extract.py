import os
import PyPDF2

def extract_text_from_pdfs(directory):
    with open('project_docs.txt', 'w', encoding='utf-8') as outfile:
        for filename in sorted(os.listdir(directory)):
            if filename.lower().endswith('.pdf'):
                filepath = os.path.join(directory, filename)
                try:
                    with open(filepath, 'rb') as pdf_file:
                        reader = PyPDF2.PdfReader(pdf_file)
                        outfile.write(f"\n{'='*40}\nFILE: {filename}\n{'='*40}\n")
                        for i, page in enumerate(reader.pages):
                            text = page.extract_text()
                            if text:
                                outfile.write(f"\n--- Page {i+1} ---\n")
                                outfile.write(text)
                except Exception as e:
                    outfile.write(f"\nError reading {filename}: {e}\n")

if __name__ == '__main__':
    extract_text_from_pdfs('.')
