"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Photo } from "@/lib/photos";
import Canvas from "./Canvas";

type Project = {
  cat: string;
  title: string;
  slug: string;
  main: string;
};

export default function ProjectExperience({
  project,
  photos,
}: {
  project: Project;
  photos: Photo[];
}) {
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const hide = () => setHint(false);
    const t = setTimeout(hide, 5000);
    window.addEventListener("wheel", hide, { once: true, passive: true });
    return () => clearTimeout(t);
  }, []);

  return (
    <>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13, letterSpacing: "0.26em", fontWeight: 400, color: "#fff" }}>
            YASSINE&apos;S&nbsp;LENS
          </span>
          <span
            className="font-mono"
            style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}
          >
            {project.title}
          </span>
        </div>

        <Link
          href="/"
          data-cursor="Close"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.8)",
            cursor: "none",
            textDecoration: "none",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span className="font-mono">Back</span>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              lineHeight: 1,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            ×
          </span>
        </Link>
      </header>

      <Canvas photos={photos} paused={false} />

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
        <span
          className="font-mono"
          style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}
        >
          Move cursor to the edge — or scroll
        </span>
        <span style={{ color: "var(--red)", fontSize: 12 }}>↓</span>
      </div>
    </>
  );
}
