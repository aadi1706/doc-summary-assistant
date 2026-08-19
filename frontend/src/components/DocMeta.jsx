import { FileText, Image, Tag, Hash, BookOpen } from "lucide-react";

const DOC_TYPE_LABELS = {
  invoice: "Invoice",
  resume: "Resume / CV",
  research_paper: "Research Paper",
  legal: "Legal Document",
  report: "Report",
  email: "Email",
  news_article: "News Article",
  general: "General Document",
};

export default function DocMeta({ doc }) {
  const Icon = doc.file_type === "pdf" ? FileText : Image;

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: "var(--accent-dim)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color="var(--accent)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 600,
          fontSize: "14px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {doc.filename}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: 2 }}>
          {DOC_TYPE_LABELS[doc.doc_type] || "Document"}
        </p>
      </div>

      <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
        {[
          { icon: BookOpen, value: doc.page_count, label: doc.page_count === 1 ? "page" : "pages" },
          { icon: Hash, value: doc.word_count?.toLocaleString(), label: "words" },
        ].map(({ icon: Icon2, value, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 600, fontSize: "15px" }}>{value}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
