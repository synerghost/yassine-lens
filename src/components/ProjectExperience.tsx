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
  instagram?: string;
  description?: string;
};

export default function ProjectExperience({
  project,
  photos,
}: {
  project: Project;
  photos: Photo[];
}) {
  const [hint, setHint] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    const hide = () => setHint(false);
    const t = setTimeout(hide, 5000);
    window.addEventListener("wheel", hide, { once: true, passive: true });
    window.addEventListener("touchstart", hide, { once: true, passive: true });
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Header */}
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
        <button
          onClick={() => setInfoOpen(true)}
          data-cursor="Open"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            background: "transparent",
            border: "none",
            cursor: "none",
            padding: 0,
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: 13, letterSpacing: "0.26em", fontWeight: 400, color: "#fff" }}>
            YASSINE&apos;S&nbsp;LENS
          </span>
          <span
            className="font-mono"
            style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}
          >
            {project.title}
          </span>
        </button>

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

      {/* Canvas */}
      <Canvas photos={photos} paused={infoOpen} />

      {/* Scroll hint */}
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
          whiteSpace: "nowrap",
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

      {/* Project info overlay */}
      <div
        aria-hidden={!infoOpen}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          background: "rgba(8,8,8,0.96)",
          backdropFilter: "blur(8px)",
          opacity: infoOpen ? 1 : 0,
          pointerEvents: infoOpen ? "auto" : "none",
          transition: "opacity .4s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px clamp(20px,5vw,80px)",
        }}
      >
        <div style={{ maxWidth: 560, width: "100%" }}>
          <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {project.cat}
          </span>
          <h2 className="font-serif" style={{ fontSize: "clamp(32px,5vw,60px)", lineHeight: 1, fontWeight: 400, marginTop: 12, marginBottom: 24 }}>
            {project.title}
          </h2>

          {project.description && (
            <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,0.65)", marginBottom: 32 }}>
              {project.description}
            </p>
          )}

          {project.instagram && (
            <a
              href={`https://www.instagram.com/${project.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Open"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "rgba(255,255,255,0.8)",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                paddingBottom: 4,
                transition: "color .2s, border-color .2s",
              }}
            >
              <span style={{ fontSize: 16 }}>📷</span>
              {project.instagram.startsWith('@') ? project.instagram : `@${project.instagram}`}
            </a>
          )}

          <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 22px",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 999,
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                transition: "all .2s",
              }}
            >
              ← Retour
            </Link>
          </div>
        </div>

        <button
          onClick={() => setInfoOpen(false)}
          data-cursor="Close"
          style={{
            position: "absolute",
            top: 22,
            right: "clamp(20px,4vw,56px)",
            width: 40, height: 40,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "#fff",
            fontSize: 18,
            cursor: "none",
          }}
        >
          ×
        </button>
      </div>
    </>
  );
}
