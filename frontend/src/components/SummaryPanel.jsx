import { useState } from "react";
import { Sparkles, Copy, Check, Loader } from "lucide-react";
import { streamSummary } from "../utils/api";

const LENGTHS = [
  { key: "short", label: "Short", desc: "3-5 sentences" },
  { key: "medium", label: "Medium", desc: "2-3 paragraphs" },
  { key: "long", label: "Long", desc: "Full breakdown" },
];

export default function SummaryPanel({ doc }) {
  const [length, setLength] = useState("medium");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleSummarize() {
    setLoading(true);
    setSummary("");
    setError("");

    try {
      await streamSummary(doc.text, length, doc.doc_type, (chunk) => {
        setSummary((prev) => prev + chunk);
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Summary</span>
        </div>

        {/* Length toggle */}
        <div style={{
          display: "flex",
          background: "var(--surface-2)",
          borderRadius: 8,
          padding: 3,
          gap: 2,
        }}>
          {LENGTHS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setLength(key)}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                border: "none",
                background: length === key ? "var(--accent)" : "transparent",
                color: length === key ? "#fff" : "var(--text-muted)",
                fontSize: "13px",
                fontWeight: length === key ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px" }}>
        {!summary && !loading && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: 16 }}>
              Choose a summary length and generate
            </p>
            <button
              onClick={handleSummarize}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Generate Summary
            </button>
          </div>
        )}

        {loading && !summary && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", padding: "8px 0" }}>
            <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "13px" }}>Generating summary...</span>
          </div>
        )}

        {summary && (
          <>
            <p style={{
              lineHeight: 1.75,
              fontSize: "14px",
              color: "var(--text)",
              whiteSpace: "pre-wrap",
            }}>
              {summary}
              {loading && (
                <span style={{
                  display: "inline-block",
                  width: 2,
                  height: "1em",
                  background: "var(--accent)",
                  marginLeft: 2,
                  verticalAlign: "middle",
                  animation: "blink 1s step-end infinite",
                }} />
              )}
            </p>

            {!loading && (
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 7,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: copied ? "var(--success)" : "var(--text-muted)",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleSummarize}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 7,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <Sparkles size={13} />
                  Regenerate
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <p style={{ color: "var(--error)", fontSize: "13px", marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
