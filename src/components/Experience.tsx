"use client";

import { useEffect, useMemo, useState } from "react";
import type { Photo } from "@/lib/photos";
import Canvas from "./Canvas";
import InfoOverlay from "./InfoOverlay";
import FilterBar from "./FilterBar";

export default function Experience({ photos }: { photos: Photo[] }) {
  const [info, setInfo] = useState(false);
  const [hint, setHint] = useState(true);
  const [cats, setCats] = useState<string[]>([]);

  const filtered = useMemo(
    () => (cats.length ? photos.filter((p) => cats.includes(p.cat)) : photos),
    [cats, photos]
  );
  const filterKey = cats.length ? [...cats].sort().join("-") : "all";

  useEffect(() => {
    const hide = () => setHint(false);
    const t = setTimeout(hide, 5000);
    window.addEventListener("wheel", hide, { once: true, passive: true });
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setInfo(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Accessible / SEO heading (visually hidden) */}
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Yassine&apos;s Lens — Yassine Zennar, photographe music, hospitality &amp; sport au Maroc
      </h1>

      {/* Minimal glass header (iOS-style liquid glass) */}
      <header
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          right: 12,
          zIndex: 250,
          height: 54,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px 0 22px",
          background: "rgba(18,18,18,0.34)",
          backdropFilter: "blur(22px) saturate(1.6)",
          WebkitBackdropFilter: "blur(22px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.25), 0 10px 34px rgba(0,0,0,0.35)",
        }}
      >
        <span style={{ fontSize: 13, letterSpacing: "0.26em", fontWeight: 400, color: "#fff" }}>
          YASSINE&apos;S&nbsp;LENS
        </span>

        <button
          onClick={() => setInfo(true)}
          data-cursor="Open"
          aria-label="Info & booking"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "none",
            padding: 0,
          }}
        >
          <span style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontSize: 11, fontWeight: 300, letterSpacing: "0.08em", color: "rgba(255,255,255,0.85)" }}>
            Contact
          </span>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              lineHeight: 1,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            +
          </span>
        </button>
      </header>

      {/* Glassy category filters */}
      <FilterBar selected={cats} onChange={setCats} />

      {/* Single giant canvas (remounts on filter change -> fresh layout from top) */}
      <Canvas key={filterKey} photos={filtered} paused={info} />

      {/* Auto-scroll hint */}
      <div
        style={{
          position: "fixed",
          bottom: 22,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: hint ? 1 : 0,
          transition: "opacity .6s ease",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontSize: 10, fontWeight: 300, letterSpacing: "0.06em", color: "rgba(255,255,255,0.45)" }}>
          Move cursor to the edge — or scroll
        </span>
        <span style={{ color: "var(--red)", fontSize: 12 }}>↓</span>
      </div>

      <InfoOverlay open={info} onClose={() => setInfo(false)} />
    </>
  );
}
