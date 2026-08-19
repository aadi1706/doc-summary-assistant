from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import documents, summarize, chat

app = FastAPI(
    title="DocuSense API",
    description="Document intelligence API — extract, summarize, and chat with your documents",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(summarize.router, prefix="/api/summarize", tags=["summarize"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/")
def root():
    return {"status": "ok", "message": "DocuSense API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
