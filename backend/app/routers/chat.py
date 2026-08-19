from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.ai_service import chat_with_document

router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    text: str         # full document text
    question: str     # current question
    history: list[ChatMessage] = []  # previous turns


@router.post("/ask")
async def ask_document(request: ChatRequest):
    """
    Ask a question about the document. Streams the response.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Document text is empty.")

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question is empty.")

    history = [{"role": m.role, "content": m.content} for m in request.history]

    async def generate():
        try:
            async for chunk in chat_with_document(request.text, request.question, history):
                yield chunk
        except Exception as e:
            yield f"\n\n[Error: {str(e)}]"

    return StreamingResponse(generate(), media_type="text/plain")
