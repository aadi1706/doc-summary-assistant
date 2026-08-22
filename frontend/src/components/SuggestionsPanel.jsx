import { useState } from "react";
import { Lightbulb, Loader, ChevronDown, ChevronUp } from "lucide-react";

function renderText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

function SuggestionCard({ suggestion, index }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          background: "var(--surface-2)",
        }}
      >
        <span style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "var(--border)",
          color: "var(--text-muted)",
          fontSize: "11px", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {index + 1}
        </span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: "13px", color: "var(--text)" }}>
          {suggestion.title}
        </span>
        <span style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          marginRight: 6,
          fontWeight: 500,
        }}>
          {suggestion.category}
        </span>
        {expanded
          ? <ChevronUp size={14} color="var(--text-muted)" />
          : <ChevronDown size={14} color="var(--text-muted)" />}
      </div>

      {expanded && (
        <div style={{
          padding: "12px 16px 14px 50px",
          fontSize: "13px", lineHeight: 1.7,
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border)",
        }}>
          {renderText(suggestion.detail)}
        </div>
      )}
    </div>
  );
}

export default function SuggestionsPanel({ doc }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setSuggestions([]);
    setError("");

    try {
      const res = await fetch("/api/summarize/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: doc.text, doc_type: doc.doc_type }),
      });

      if (!res.ok) throw new Error("Failed to generate suggestions");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
      }

      try {
        const clean = full.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setSuggestions(parsed.suggestions || []);
      } catch {
        setError("Could not parse suggestions. Try again.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <Lightbulb size={16} color="var(--accent)" />
        <span style={{ fontWeight: 600, fontSize: "14px" }}>Improvement Suggestions</span>
      </div>

      <div style={{ padding: "20px" }}>
        {!suggestions.length && !loading && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: 6 }}>
              Analyse this document for areas of improvement
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: 18, opacity: 0.7 }}>
              Works best on resumes, reports, emails, and legal documents
            </p>
            <button
              onClick={handleGenerate}
              style={{
                background: "var(--accent)", color: "#fff",
                border: "none", borderRadius: 8,
                padding: "10px 24px", fontSize: "14px",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              Generate Suggestions
            </button>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", padding: "8px 0" }}>
            <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "13px" }}>Analysing document...</span>
          </div>
        )}

        {suggestions.length > 0 && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} index={i} />
            ))}
            <button
              onClick={handleGenerate}
              style={{
                marginTop: 8,
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 7,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text-muted)", fontSize: "13px", cursor: "pointer",
                width: "fit-content",
              }}
            >
              <Lightbulb size={13} />
              Regenerate
            </button>
          </div>
        )}

        {error && (
          <p style={{ color: "var(--error)", fontSize: "13px", marginTop: 8 }}>{error}</p>
        )}
      </div>

      <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}
