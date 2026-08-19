const BASE = "/api";

/**
 * Upload a file and get back extracted text + metadata.
 */
export async function uploadDocument(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/documents/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }

  return res.json();
}

/**
 * Stream a summary. Calls onChunk with each text chunk as it arrives.
 * Returns the full summary string when done.
 */
export async function streamSummary(text, length, docType, onChunk) {
  const res = await fetch(`${BASE}/summarize/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, length, doc_type: docType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Summary failed" }));
    throw new Error(err.detail || "Summary failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onChunk(chunk);
  }

  return full;
}

/**
 * Extract named entities from document text.
 */
export async function extractEntities(text, docType) {
  const res = await fetch(`${BASE}/summarize/entities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, doc_type: docType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Entity extraction failed" }));
    throw new Error(err.detail || "Entity extraction failed");
  }

  return res.json();
}

/**
 * Ask a question about the document. Streams response via onChunk.
 */
export async function askDocument(text, question, history, onChunk) {
  const res = await fetch(`${BASE}/chat/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, question, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Chat failed" }));
    throw new Error(err.detail || "Chat failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onChunk(chunk);
  }

  return full;
}
