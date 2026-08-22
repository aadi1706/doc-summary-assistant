import anthropic
import json
import os
from typing import AsyncGenerator
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SUMMARY_PROMPTS = {
    "short": "Write a concise summary in 3-5 sentences. Focus only on the core message.",
    "medium": "Write a structured summary in 2-3 paragraphs. Cover the main points and key details.",
    "long": "Write a comprehensive summary covering all major sections, key arguments, and important details. Use paragraphs with clear structure.",
    "takeaways": "List exactly 4-5 key takeaways from this document as short bullet points. Each point should be one sentence. Start each line with a dash (-). No intro text, just the bullets.",
}

DOC_TYPE_CONTEXT = {
    "invoice": "This is a financial document/invoice.",
    "resume": "This is a resume or CV.",
    "research_paper": "This is an academic research paper.",
    "legal": "This is a legal document or contract.",
    "report": "This is a business or analytical report.",
    "email": "This is an email or correspondence.",
    "news_article": "This is a news article.",
    "general": "This is a general document.",
}


async def stream_summary(text: str, length: str, doc_type: str) -> AsyncGenerator[str, None]:
    """
    Stream a summary of the document text.
    Yields text chunks as they arrive from the API.
    """
    doc_context = DOC_TYPE_CONTEXT.get(doc_type, DOC_TYPE_CONTEXT["general"])
    length_instruction = SUMMARY_PROMPTS.get(length, SUMMARY_PROMPTS["medium"])

    # Truncate if very long document — avoid token limits
    max_chars = 12000
    truncated = text[:max_chars] + ("\n\n[Document truncated for processing...]" if len(text) > max_chars else "")

    prompt = f"""{doc_context}

{length_instruction}

Document content:
---
{truncated}
---

Write the summary now. Do not include headers like "Summary:" — just write the summary directly."""

    with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        for text_chunk in stream.text_stream:
            yield text_chunk


def extract_entities(text: str, doc_type: str) -> dict:
    """
    Extract named entities and key information from document text.
    Returns structured entity data.
    """
    max_chars = 8000
    truncated = text[:max_chars]

    prompt = f"""Extract key information from this {doc_type} document.

Return ONLY a valid JSON object with these fields (include only fields that have actual data):
{{
  "people": ["list of person names mentioned"],
  "organizations": ["list of company/org names"],
  "dates": ["list of dates or time references"],
  "amounts": ["list of monetary amounts, quantities, or numbers"],
  "locations": ["list of places, cities, countries"],
  "key_terms": ["5-8 most important domain-specific terms or concepts"]
}}

If a field has no data, use an empty array [].
Return only the JSON, no explanation.

Document:
---
{truncated}
---"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.content[0].text.strip()

    # strip markdown code fences if model wraps in them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "people": [], "organizations": [], "dates": [],
            "amounts": [], "locations": [], "key_terms": []
        }


async def chat_with_document(text: str, question: str, history: list) -> AsyncGenerator[str, None]:
    """
    Stream an answer to a question about the document.
    history is a list of {"role": "user"/"assistant", "content": "..."} dicts.
    """
    max_chars = 10000
    truncated = text[:max_chars] + ("\n\n[Document truncated...]" if len(text) > max_chars else "")

    system_prompt = f"""You are a helpful assistant that answers questions about a document.
Only use information from the document to answer. If the answer isn't in the document, say so clearly.
Be concise and direct.

Document content:
---
{truncated}
---"""

    messages = history + [{"role": "user", "content": question}]

    with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        system=system_prompt,
        messages=messages
    ) as stream:
        for text_chunk in stream.text_stream:
            yield text_chunk


async def stream_suggestions(text: str, doc_type: str) -> AsyncGenerator[str, None]:
    """
    Generate improvement suggestions for a document.
    Returns structured JSON streamed as text.
    """
    max_chars = 8000
    truncated = text[:max_chars]

    doc_context = DOC_TYPE_CONTEXT.get(doc_type, DOC_TYPE_CONTEXT["general"])

    prompt = f"""{doc_context}

Analyse this document and provide 4-5 specific, actionable improvement suggestions.

Return ONLY a valid JSON object in this exact format:
{{
  "suggestions": [
    {{
      "title": "Short title of the suggestion",
      "category": "one of: Structure, Clarity, Content, Tone, Completeness",
      "detail": "2-3 sentences explaining the issue and how to fix it"
    }}
  ]
}}

Be specific to this document — reference actual content where possible.
Return only the JSON, no markdown fences, no explanation.

Document:
---
{truncated}
---"""

    with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        for text_chunk in stream.text_stream:
            yield text_chunk
