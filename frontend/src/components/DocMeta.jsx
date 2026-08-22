import { FileText, Image, BookOpen, Hash, Clock, Tag } from "lucide-react";

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

const DOC_TYPE_COLORS = {
  invoice: "#22c55e",
  resume: "#818cf8",
  research_paper: "#60a5fa",
  legal: "#f59e0b",
  report: "#34d399",
  email: "#f472b6",
  news_article: "#fb923c",
  general: "#888899",
};

function readTime(wordCount) {
  const mins = Math.ceil(wordCount / 200);
  return mins === 1 ? "1 min read" : `${mins} min read`;
}

export default function DocMeta({ doc }) {
  const Icon = doc.file_type === "pdf" ? FileText : Image;
  const typeColor = DOC_TYPE_COLORS[doc.doc_type] || DOC_TYPE_COLORS.general;
  const typeLabel = DOC_TYPE_LABELS[doc.doc_type] || "Document";

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
        width: 40, height: 40, borderRadius: 8,
        background: "var(--accent-dim)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color="var(--accent)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 600, fontSize: "14px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {doc.filename}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: `${typeColor}18`,
            border: `1px solid ${typeColor}40`,
            color: typeColor,
            borderRadius: 5, padding: "2px 8px", fontSize: "11px", fontWeight: 600,
          }}>
            <Tag size={10} />
            {typeLabel}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
        {[
          { icon: BookOpen, value: doc.page_count, label: doc.page_count === 1 ? "page" : "pages" },
          { icon: Hash, value: doc.word_count?.toLocaleString(), label: "words" },
          { icon: Clock, value: readTime(doc.word_count), label: "" },
        ].map(({ icon: Icon2, value, label }) => (
          <div key={label || value} style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
              <Icon2 size={12} color="var(--text-muted)" />
              {value}
            </p>
            {label && <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>{label}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
