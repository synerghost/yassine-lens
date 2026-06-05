"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Photo } from "@/lib/photos";
import Canvas from "./Canvas";
import InfoOverlay from "./InfoOverlay";
import FilterBar from "./FilterBar";
import ThemeToggle from "./ThemeToggle";
import GlassHeader, { CircleButton } from "./GlassHeader";

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

      <GlassHeader>
        <Link href="/" style={{ textDecoration: "none", display: "flex" }} data-cursor="Home">
          <span style={{ fontSize: 13, letterSpacing: "0.26em", fontWeight: 400, color: "var(--fg)" }}>
            YASSINE&apos;S&nbsp;LENS
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <button
            onClick={() => setInfo(true)}
            data-cursor="Open"
            aria-label="Info & booking"
            style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", color: "var(--fg)", cursor: "none", padding: 0 }}
          >
            <span style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontSize: 11, fontWeight: 300, letterSpacing: "0.08em", color: "var(--muted)" }}>
              Contact
            </span>
            <CircleButton>+</CircleButton>
          </button>
        </div>
      </GlassHeader>

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
