import { useState } from "react";
import { TbUsers, TbBuilding, TbCalendar, TbCurrencyDollar, TbMapPin, TbTag } from "react-icons/tb";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { extractEntities } from "../utils/api";

const ENTITY_CONFIG = [
  { key: "people", label: "People", icon: TbUsers, color: "var(--text-muted)" },
  { key: "organizations", label: "Organizations", icon: TbBuilding, color: "var(--text-muted)" },
  { key: "dates", label: "Dates", icon: TbCalendar, color: "var(--text-muted)" },
  { key: "amounts", label: "Amounts", icon: TbCurrencyDollar, color: "var(--text-muted)" },
  { key: "locations", label: "Locations", icon: TbMapPin, color: "var(--text-muted)" },
  { key: "key_terms", label: "Key Terms", icon: TbTag, color: "var(--text-muted)" },
];

export default function EntityCards({ doc }) {
  const [entities, setEntities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExtract() {
    setLoading(true);
    setError("");
    try {
      const result = await extractEntities(doc.text, doc.doc_type);
      setEntities(result.entities);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const hasAnyEntities = entities && Object.values(entities).some((arr) => arr.length > 0);

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
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <TbTag size={16} color="var(--accent)" />
        <span style={{ fontWeight: 600, fontSize: "14px" }}>Entities & Key Info</span>
      </div>

      <div style={{ padding: "20px" }}>
        {!entities && !loading && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: 14 }}>
              Extract people, dates, organizations, and key terms
            </p>
            <button
              onClick={handleExtract}
              style={{
                background: "var(--surface-2)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "9px 20px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Extract Entities
            </button>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
            <AiOutlineLoading3Quarters size={14} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "13px" }}>Analysing document...</span>
          </div>
        )}

        {entities && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {!hasAnyEntities && (
              <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                No specific entities found in this document.
              </p>
            )}
            {ENTITY_CONFIG.map(({ key, label, icon: Icon, color }) => {
              const items = entities[key];
              if (!items || items.length === 0) return null;

              return (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Icon size={13} color={color} />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {label}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {items.map((item, i) => (
                      <span
                        key={i}
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          borderRadius: 6,
                          padding: "3px 10px",
                          fontSize: "12px",
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <p style={{ color: "var(--error)", fontSize: "13px" }}>{error}</p>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
