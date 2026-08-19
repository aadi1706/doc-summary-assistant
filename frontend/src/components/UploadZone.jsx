import { useState, useRef } from "react";
import { UploadCloud, FileText, Image } from "lucide-react";

export default function UploadZone({ onFile, loading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

  function handleFile(file) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      alert("Please upload a PDF or image file (JPG, PNG, WEBP).");
      return;
    }
    onFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  function onDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  function onInputChange(e) {
    handleFile(e.target.files[0]);
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !loading && inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
        background: dragging ? "var(--accent-dim)" : "var(--surface)",
        borderRadius: "12px",
        padding: "48px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        opacity: loading ? 0.6 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={onInputChange}
        disabled={loading}
      />

      <div style={{
        width: 56,
        height: 56,
        borderRadius: "12px",
        background: "var(--accent-dim)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <UploadCloud size={28} color="var(--accent)" />
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 600, fontSize: "16px", marginBottom: 6 }}>
          {loading ? "Processing..." : "Drop your document here"}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          or click to browse — PDF or image files up to 10MB
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: 4 }}>
        {[
          { icon: FileText, label: "PDF" },
          { icon: Image, label: "JPG / PNG" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "12px",
              color: "var(--text-muted)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "4px 10px",
            }}
          >
            <Icon size={12} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
