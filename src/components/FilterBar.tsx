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
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    if (!isMobile) return;
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const toggle = (cat: string) => {
    onChange(selected.includes(cat) ? selected.filter((c) => c !== cat) : [...selected, cat]);
  };

  const chip = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    padding: isMobile ? "9px 16px" : "7px 16px",
    borderRadius: 999,
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
    fontSize: isMobile ? 12 : 11,
    fontWeight: active ? 500 : 300,
    letterSpacing: "0.04em",
    cursor: "none",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "background .2s ease, color .2s ease, border-color .2s ease",
    border: `1px solid ${active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.18)"}`,
    background: active ? "#fff" : "transparent",
    color: active ? "#000" : "rgba(255,255,255,0.72)",
    WebkitTapHighlightColor: "transparent",
  });

  // ── Desktop: thin row at top ──────────────────────────────────
  if (!isMobile) {
    return (
      <div
        style={{
          position: "fixed",
          top: 68,
          left: 0,
          right: 0,
          zIndex: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "0 16px",
          overflowX: "auto",
          scrollbarWidth: "none",
        } as React.CSSProperties}
      >
        <button onClick={() => onChange([])} style={chip(selected.length === 0)} data-cursor="Filter" aria-pressed={selected.length === 0}>All</button>
        {CATEGORIES.map((cat) => {
          const active = selected.includes(cat);
          return (
            <button key={cat} onClick={() => toggle(cat)} style={chip(active)} data-cursor="Filter" aria-pressed={active}>
              {CAT_LABEL[cat]}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Mobile: single glass pill at the bottom ───────────────────
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 240,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 6px",
        borderRadius: 999,
        background: "rgba(12,12,12,0.72)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        maxWidth: "calc(100vw - 32px)",
        overflowX: "auto",
        scrollbarWidth: "none",
      } as React.CSSProperties}
    >
      {/* ↑ Back to top — only when scrolled */}
      {scrolled && (
        <>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "rgba(255,255,255,0.65)",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            } as React.CSSProperties}
            aria-label="Scroll to top"
          >
            ↑
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
        </>
      )}

      <button onClick={() => onChange([])} style={chip(selected.length === 0)} aria-pressed={selected.length === 0}>All</button>
      {CATEGORIES.map((cat) => {
        const active = selected.includes(cat);
        return (
          <button key={cat} onClick={() => toggle(cat)} style={chip(active)} aria-pressed={active}>
            {CAT_LABEL[cat]}
          </button>
        );
      })}
    </div>
  );
}
