import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader, Bot, User } from "lucide-react";
import { askDocument } from "../utils/api";

const SUGGESTIONS = [
  "What is the main topic of this document?",
  "Summarize the key findings.",
  "Who are the key people mentioned?",
  "What are the important dates?",
];

function renderText(text) {
  // Simple bold markdown renderer
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

export default function ChatPanel({ doc }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleAsk(question) {
    if (!question.trim() || loading) return;

    const userMsg = { role: "user", content: question };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "", streaming: true }]);
    setInput("");
    setLoading(true);

    try {
      let full = "";
      await askDocument(doc.text, question, history, (chunk) => {
        full += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: full, streaming: true };
          return updated;
        });
      });

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: full, streaming: false };
        return updated;
      });
    } catch (e) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `Error: ${e.message}`,
          streaming: false,
          error: true,
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk(input);
    }
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "420px",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
      }}>
        <MessageSquare size={16} color="var(--accent)" />
        <span style={{ fontWeight: 600, fontSize: "14px" }}>Ask the Document</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: 12 }}>
              Ask anything about your document
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleAsk(s)}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: msg.role === "user" ? "var(--accent)" : "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              {msg.role === "user"
                ? <User size={14} color="#fff" />
                : <Bot size={14} color="var(--accent)" />
              }
            </div>
            <div style={{
              background: msg.role === "user" ? "var(--accent-dim)" : "var(--surface-2)",
              border: `1px solid ${msg.error ? "var(--error)" : "var(--border)"}`,
              borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
              padding: "10px 14px",
              fontSize: "13px",
              lineHeight: 1.7,
              color: msg.error ? "var(--error)" : "var(--text)",
              maxWidth: "80%",
            }}>
              {msg.streaming && !msg.content
                ? <Loader size={12} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite" }} />
                : <span>{renderText(msg.content)}</span>
              }
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        gap: 8,
        flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question about the document..."
          disabled={loading}
          style={{
            flex: 1,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "9px 14px",
            fontSize: "13px",
            color: "var(--text)",
            outline: "none",
          }}
        />
        <button
          onClick={() => handleAsk(input)}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? "var(--surface-2)" : "var(--accent)",
            border: "none",
            borderRadius: 8,
            padding: "0 14px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Send size={15} color={loading || !input.trim() ? "var(--text-muted)" : "#fff"} />
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
