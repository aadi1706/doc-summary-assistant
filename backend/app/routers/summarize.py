from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.ai_service import stream_summary, extract_entities

router = APIRouter()


class SummarizeRequest(BaseModel):
    text: str
    length: str = "medium"  # short | medium | long
    doc_type: str = "general"


class EntityRequest(BaseModel):
    text: str
    doc_type: str = "general"


@router.post("/stream")
async def summarize_stream(request: SummarizeRequest):
    """
    Stream a summary of the document.
    Response is text/event-stream — frontend reads chunks as they arrive.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Document text is empty.")

    if request.length not in ["short", "medium", "long", "takeaways"]:
        raise HTTPException(status_code=400, detail="Length must be short, medium, or long.")

    async def generate():
        try:
            async for chunk in stream_summary(request.text, request.length, request.doc_type):
                yield chunk
        except Exception as e:
            yield f"\n\n[Error generating summary: {str(e)}]"

    return StreamingResponse(generate(), media_type="text/plain")


@router.post("/entities")
async def get_entities(request: EntityRequest):
    """
    Extract named entities and key terms from the document.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Document text is empty.")

    try:
        entities = extract_entities(request.text, request.doc_type)
        return {"entities": entities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entity extraction failed: {str(e)}")
