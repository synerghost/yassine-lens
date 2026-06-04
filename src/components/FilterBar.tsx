"use client";

import { CATEGORIES, CAT_LABEL } from "@/lib/categories";

const glass: React.CSSProperties = {
  background: "rgba(18,18,18,0.34)",
  backdropFilter: "blur(22px) saturate(1.6)",
  WebkitBackdropFilter: "blur(22px) saturate(1.6)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.25), 0 10px 34px rgba(0,0,0,0.35)",
};

export default function FilterBar({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (cat: string) => {
    onChange(selected.includes(cat) ? selected.filter((c) => c !== cat) : [...selected, cat]);
  };

  const chip = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: "none",
    whiteSpace: "nowrap",
    transition: "background .25s ease, color .25s ease, border-color .25s ease",
    border: `1px solid ${active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.18)"}`,
    background: active ? "#fff" : "transparent",
    color: active ? "#000" : "rgba(255,255,255,0.8)",
  });

  const box = (active: boolean): React.CSSProperties => ({
    width: 12,
    height: 12,
    borderRadius: 3,
    border: `1px solid ${active ? "#000" : "rgba(255,255,255,0.5)"}`,
    background: active ? "#000" : "transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 9,
    lineHeight: 1,
    color: "#fff",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 76,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 240,
        maxWidth: "calc(100vw - 24px)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 6,
        padding: 6,
        borderRadius: 999,
        ...glass,
      }}
    >
      <button onClick={() => onChange([])} style={chip(selected.length === 0)} data-cursor="Filter" aria-pressed={selected.length === 0}>
        All
      </button>
      {CATEGORIES.map((cat) => {
        const active = selected.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            style={chip(active)}
            data-cursor="Filter"
            aria-pressed={active}
          >
            <span style={box(active)}>{active ? "✓" : ""}</span>
            {CAT_LABEL[cat]}
          </button>
        );
      })}
    </div>
  );
}
