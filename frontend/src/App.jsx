import { useState } from "react";
import { TbFileSearch, TbRotateClockwise, TbBrandGithub } from "react-icons/tb";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import UploadZone from "./components/UploadZone";
import DocMeta from "./components/DocMeta";
import SummaryPanel from "./components/SummaryPanel";
import EntityCards from "./components/EntityCards";
import ChatPanel from "./components/ChatPanel";
import SuggestionsPanel from "./components/SuggestionsPanel";
import { uploadDocument } from "./utils/api";

const PIPELINE_STEPS = [
  "Reading file",
  "Extracting text",
  "Detecting document type",
  "Ready",
];

export default function App() {
  const [doc, setDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pipelineStep, setPipelineStep] = useState(0);
  const [activeTab, setActiveTab] = useState("summary");

  async function handleFile(file) {
    setUploading(true);
    setUploadError("");
    setDoc(null);
    setPipelineStep(0);

    const stepInterval = setInterval(() => {
      setPipelineStep((s) => Math.min(s + 1, PIPELINE_STEPS.length - 2));
    }, 600);

    try {
      const result = await uploadDocument(file);
      clearInterval(stepInterval);
      setPipelineStep(PIPELINE_STEPS.length - 1);
      setTimeout(() => {
        setDoc(result);
        setActiveTab("summary");
      }, 400);
    } catch (e) {
      clearInterval(stepInterval);
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function handleReset() {
    setDoc(null);
    setUploadError("");
    setPipelineStep(0);
  }

  const TABS = [
    { key: "summary", label: "Summary" },
    { key: "entities", label: "Entities" },
    { key: "chat", label: "Chat" },
    { key: "suggestions", label: "Suggestions" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TbFileSearch size={22} color="var(--accent)" />
          <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px" }}>
            DocuSense
          </span>
        </div>
        <a
          href="https://github.com/aadi1706/doc-summary-assistant"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, fontSize: "13px", textDecoration: "none" }}
        >
          <TbBrandGithub size={17} />
          GitHub
        </a>
      </nav>

      {/* Main */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        {!doc && (
          <>
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: 8 }}>
                Document Intelligence
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                Upload a PDF or image — get summaries, entities, and answers in seconds
              </p>
            </div>

            <UploadZone onFile={handleFile} loading={uploading} />

            {uploading && (
              <div style={{
                marginTop: 20,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "16px 20px",
              }}>
                {PIPELINE_STEPS.map((step, i) => {
                  const done = i < pipelineStep;
                  const active = i === pipelineStep;
                  return (
                    <div key={step} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 0",
                      opacity: done || active ? 1 : 0.3,
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: done ? "var(--success)" : active ? "var(--accent)" : "var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {active && <AiOutlineLoading3Quarters size={11} color="#fff" style={{ animation: "spin 1s linear infinite" }} />}
                        {done && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: "13px", color: active ? "var(--text)" : "var(--text-muted)" }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {uploadError && (
              <div style={{
                marginTop: 16,
                background: "#dc262618",
                border: "1px solid #dc262640",
                borderRadius: 8,
                padding: "12px 16px",
                color: "var(--error)",
                fontSize: "13px",
              }}>
                {uploadError}
              </div>
            )}
          </>
        )}

        {doc && (
          <>
            <div style={{ marginBottom: 20 }}>
              <DocMeta doc={doc} />
              <button
                onClick={handleReset}
                style={{
                  marginTop: 10,
                  display: "flex", alignItems: "center", gap: 6,
                  background: "transparent", border: "none",
                  color: "var(--text-muted)", fontSize: "12px",
                  cursor: "pointer", padding: "4px 0",
                }}
              >
                <TbRotateClockwise size={13} />
                Upload a different document
              </button>
            </div>

            <div style={{
              display: "flex",
              borderBottom: "1px solid var(--border)",
              marginBottom: 20,
              gap: 2,
            }}>
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "transparent",
                    color: activeTab === key ? "var(--accent)" : "var(--text-muted)",
                    fontWeight: activeTab === key ? 600 : 400,
                    fontSize: "14px",
                    cursor: "pointer",
                    borderBottom: activeTab === key ? "2px solid var(--accent)" : "2px solid transparent",
                    marginBottom: -1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "summary" && <SummaryPanel doc={doc} />}
            {activeTab === "entities" && <EntityCards doc={doc} />}
            {activeTab === "chat" && <ChatPanel doc={doc} />}
            {activeTab === "suggestions" && <SuggestionsPanel doc={doc} />}
          </>
        )}
      </main>

      <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}
