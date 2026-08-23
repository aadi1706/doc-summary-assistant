import { useState, useRef } from "react";
import { TbCloudUpload, TbFileTypePdf, TbPhoto } from "react-icons/tb";

export default function UploadZone({ onFile, loading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const ACCEPTED = ["application/pdf"];

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
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
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
        accept=".pdf"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
        disabled={loading}
      />

      <div style={{
        width: 52, height: 52, borderRadius: "10px",
        background: "var(--accent-dim)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <TbCloudUpload size={26} color="var(--accent)" />
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 600, fontSize: "16px", marginBottom: 6 }}>
          {loading ? "Processing..." : "Drop your document here"}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          or click to browse — PDF or image files up to 10MB
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: 4 }}>
        {[
          { icon: TbFileTypePdf, label: "PDF" },
          
        ].map(({ icon: Icon, label }) => (
          <span key={label} style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: "12px", color: "var(--text-muted)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 6, padding: "4px 10px",
          }}>
            <Icon size={12} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
