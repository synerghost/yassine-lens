"use client";

import { CATEGORIES, CAT_LABEL } from "@/lib/categories";

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
    gap: 6,
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: "none",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "background .2s ease, color .2s ease, border-color .2s ease",
    border: `1px solid ${active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.22)"}`,
    background: active ? "#fff" : "rgba(10,10,10,0.55)",
    backdropFilter: "blur(14px) saturate(1.4)",
    WebkitBackdropFilter: "blur(14px) saturate(1.4)",
    color: active ? "#000" : "rgba(255,255,255,0.8)",
    boxShadow: active
      ? "none"
      : "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.3)",
  });

  const box = (active: boolean): React.CSSProperties => ({
    width: 11,
    height: 11,
    borderRadius: 3,
    border: `1px solid ${active ? "#000" : "rgba(255,255,255,0.45)"}`,
    background: active ? "#000" : "transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 8,
    lineHeight: 1,
    color: "#fff",
    flexShrink: 0,
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 68,
        left: 0,
        right: 0,
        zIndex: 240,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "0 16px",
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      } as React.CSSProperties}
    >
      <button
        onClick={() => onChange([])}
        style={chip(selected.length === 0)}
        data-cursor="Filter"
        aria-pressed={selected.length === 0}
      >
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
