import pymupdf as fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import re
from typing import Optional


def extract_text_from_pdf(file_bytes: bytes) -> dict:
    """
    Extract text from a PDF file.
    Returns text content, page count, and basic metadata.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages_text = []
    full_text = ""

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        pages_text.append({
            "page": page_num + 1,
            "text": text.strip()
        })
        full_text += text + "\n"

    doc.close()

    return {
        "text": full_text.strip(),
        "page_count": len(pages_text),
        "pages": pages_text,
        "char_count": len(full_text.strip()),
        "word_count": len(full_text.split())
    }


def extract_text_from_image(file_bytes: bytes) -> dict:
    """
    Extract text from an image file using Tesseract OCR.
    """
    image = Image.open(io.BytesIO(file_bytes))

    # Run OCR
    text = pytesseract.image_to_string(image, config="--psm 3")

    return {
        "text": text.strip(),
        "page_count": 1,
        "char_count": len(text.strip()),
        "word_count": len(text.split())
    }


def detect_document_type(text: str) -> str:
    """
    Simple heuristic to detect what kind of document this is.
    Used to adjust the summarization prompt.
    """
    text_lower = text.lower()

    patterns = {
        "invoice": ["invoice", "bill to", "amount due", "payment", "subtotal", "tax"],
        "resume": ["experience", "education", "skills", "projects", "work history", "curriculum vitae", "cv"],
        "research_paper": ["abstract", "introduction", "methodology", "conclusion", "references", "doi", "journal"],
        "legal": ["agreement", "whereas", "hereinafter", "terms and conditions", "party", "clause", "liability"],
        "report": ["executive summary", "findings", "recommendation", "analysis", "quarterly", "annual report"],
        "email": ["from:", "to:", "subject:", "dear", "regards", "sincerely"],
        "news_article": ["published", "reporter", "journalist", "according to", "breaking"],
    }

    scores = {}
    for doc_type, keywords in patterns.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        scores[doc_type] = score

    best_match = max(scores, key=scores.get)
    if scores[best_match] >= 2:
        return best_match

    return "general"


def clean_text(text: str) -> str:
    """Remove excessive whitespace and clean up extracted text."""
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    return text.strip()
