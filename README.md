# DocuSense — Document Intelligence Assistant

Upload any PDF or scanned image and get smart summaries, entity extraction, document Q&A, and improvement suggestions — powered by Claude AI.

## Live Demo

- **Frontend:** (coming soon)
- **Backend API:** (coming soon)

## Features

- **PDF & Image Upload** — drag-and-drop or file picker, up to 10MB
- **Text Extraction** — PyMuPDF for PDFs, Tesseract OCR for images
- **Smart Summaries** — short / medium / long, streamed live token by token
- **Key Takeaways** — auto-extracted bullet points after every summary
- **Entity Extraction** — people, organizations, dates, amounts, locations, key terms
- **Document Chat** — ask questions, get answers grounded in your document
- **Improvement Suggestions** — actionable feedback on structure, clarity, content, and tone
- **Export** — download summary + takeaways as a `.txt` file
- **Document Type Detection** — auto-detects invoice, resume, research paper, legal doc, and more

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, PyMuPDF, Tesseract OCR, Anthropic Claude API |
| Frontend | React (Vite), Tailwind CSS |
| AI Model | Claude Haiku (claude-haiku-4-5) via streaming API |
| Hosting | Render (backend) + Vercel (frontend) |

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Tesseract OCR installed (`brew install tesseract` on Mac)
- Anthropic API key

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

## Project Structure

```
doc-summary-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS
│   │   ├── routers/
│   │   │   ├── documents.py     # Upload + text extraction
│   │   │   ├── summarize.py     # Summary, entities, suggestions
│   │   │   └── chat.py          # Document Q&A
│   │   └── services/
│   │       ├── extractor.py     # PyMuPDF + Tesseract
│   │       └── ai_service.py    # Claude API + streaming
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── UploadZone.jsx
        │   ├── DocMeta.jsx
        │   ├── SummaryPanel.jsx
        │   ├── EntityCards.jsx
        │   ├── ChatPanel.jsx
        │   └── SuggestionsPanel.jsx
        └── utils/
            └── api.js
```

## Architecture Notes

- PDF text extraction runs server-side with PyMuPDF — preserves formatting better than browser-based alternatives
- OCR handled by Tesseract via pytesseract — no third-party OCR service needed
- All AI responses stream token-by-token using the Anthropic streaming API, reducing perceived latency
- Document type is heuristically detected and used to adjust prompts for context-aware results
- Chat maintains message history per session for coherent multi-turn Q&A
- Frontend proxies API calls through Vite dev server — no CORS issues in development

## Approach (200 words)

DocuSense is built around a deliberate architectural decision: keep PDF parsing and OCR server-side rather than in the browser. This preserves text formatting, handles edge cases better, and avoids the 50MB+ overhead of running PDF.js and Tesseract.js client-side.

The backend is FastAPI — chosen for its async support, which is essential for streaming. All AI responses stream token-by-token through Server-Sent Events, making the app feel fast even on longer documents.

Document type detection runs before every AI call. A simple keyword heuristic classifies the document as a resume, invoice, legal doc, research paper, or general document — and the prompt changes accordingly. A resume gets different summarization guidance than a legal contract.

The four AI features (summary, entities, suggestions, chat) are separate endpoints rather than one monolithic call. This keeps responses fast, makes errors recoverable, and lets users choose what they need.

The frontend is plain React with Vite — no Next.js complexity. State lives entirely in React, with no backend session management needed. The document text is extracted once on upload and passed to each feature call from the frontend.

The result is a document intelligence tool that feels like a product, not an assignment submission.
