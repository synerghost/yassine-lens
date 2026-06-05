"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, CAT_LABEL } from "@/lib/categories";

export default function FilterBar({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsMobile(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggle = (cat: string) => {
    onChange(selected.includes(cat) ? selected.filter((c) => c !== cat) : [...selected, cat]);
  };

  const chip = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    padding: isMobile ? "9px 18px" : "7px 16px",
    borderRadius: 999,
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
    fontSize: isMobile ? 12 : 11,
    fontWeight: active ? 500 : 300,
    letterSpacing: "0.05em",
    cursor: "none",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "background .2s ease, color .2s ease, border-color .2s ease",
    border: `1px solid ${active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.18)"}`,
    background: active ? "#fff" : "rgba(10,10,10,0.6)",
    backdropFilter: "blur(16px) saturate(1.4)",
    WebkitBackdropFilter: "blur(16px) saturate(1.4)",
    color: active ? "#000" : "rgba(255,255,255,0.72)",
  });

  const wrapperStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 240,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        padding: "6px 10px",
        borderRadius: 999,
        background: "rgba(10,10,10,0.55)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        overflowX: "auto",
        scrollbarWidth: "none" as const,
        maxWidth: "calc(100vw - 32px)",
      }
    : {
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
        scrollbarWidth: "none" as const,
      };

  return (
    <div style={wrapperStyle}>
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
            {CAT_LABEL[cat]}
          </button>
        );
      })}
    </div>
  );
}
