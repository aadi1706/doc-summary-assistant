# DocuSense — Document Intelligence Assistant

Upload any PDF or scanned image and get smart summaries, entity extraction, and a document Q&A chat — all powered by Claude AI.

## Features

- **PDF & Image Upload** — drag-and-drop or file picker, up to 10MB
- **Text Extraction** — PyMuPDF for PDFs, Tesseract OCR for images
- **Smart Summaries** — short / medium / long, streamed live
- **Entity Extraction** — people, organizations, dates, amounts, locations, key terms
- **Document Chat** — ask questions and get answers grounded in your document
- **Document Type Detection** — auto-detects invoice, resume, research paper, legal doc, and more

## Tech Stack

**Backend:** FastAPI + PyMuPDF + Tesseract + Anthropic Claude API  
**Frontend:** React (Vite) + Tailwind CSS  
**Hosting:** Render (backend) + Vercel (frontend)

## Local Setup

### Backend

```bash
cd backend
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
pip install -r requirements.txt
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, proxies API calls to `http://localhost:8000`.

## Architecture Notes

- PDF text extraction runs server-side with PyMuPDF — preserves formatting better than browser-based alternatives
- OCR handled by Tesseract via pytesseract — no third-party OCR service needed
- Summaries and chat stream token-by-token using the Anthropic streaming API
- Document type is heuristically detected and used to adjust prompts for better results
- Chat maintains message history per session for coherent multi-turn Q&A
