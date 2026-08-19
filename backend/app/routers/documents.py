from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.extractor import (
    extract_text_from_pdf,
    extract_text_from_image,
    detect_document_type,
    clean_text
)

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "image",
    "image/png": "image",
    "image/webp": "image",
    "image/tiff": "image",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF or image file, extract its text, detect document type.
    Returns extracted text and metadata — frontend stores this in state.
    """
    content_type = file.content_type
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Please upload a PDF or image file."
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 10MB."
        )

    file_type = ALLOWED_TYPES[content_type]

    try:
        if file_type == "pdf":
            result = extract_text_from_pdf(file_bytes)
        else:
            result = extract_text_from_image(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract text: {str(e)}"
        )

    if not result["text"].strip():
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted from this file. The document may be empty or image-only."
        )

    cleaned = clean_text(result["text"])
    doc_type = detect_document_type(cleaned)

    return {
        "filename": file.filename,
        "file_type": file_type,
        "doc_type": doc_type,
        "text": cleaned,
        "word_count": result["word_count"],
        "char_count": result["char_count"],
        "page_count": result.get("page_count", 1),
    }
