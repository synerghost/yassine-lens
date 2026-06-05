"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Photo } from "@/lib/photos";
import Canvas from "./Canvas";
import { CAT_LABEL } from "@/lib/categories";

type Project = {
  cat: string;
  title: string;
  slug: string;
  main: string;
  instagram?: string;
  description?: string;
};

// Photos in project pages have no individual hover caps — pass as bare photos
type ProjectPhoto = Photo & { projectTitle?: string };

export default function ProjectExperience({
  project,
  photos,
}: {
  project: Project;
  photos: ProjectPhoto[];
}) {
  const [hint, setHint] = useState(true);
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  useEffect(() => {
    const hide = () => setHint(false);
    const t = setTimeout(hide, 4000);
    window.addEventListener("wheel", hide, { once: true, passive: true });
    window.addEventListener("touchstart", hide, { once: true, passive: true });
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Strip slug+title from photos so PhotoCard renders bare (no hover cap, no link)
  const barePhotos: Photo[] = photos.map(({ ...p }) => ({
    ...p,
    slug: undefined,
    title: "",
  }));

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
        <span style={{ fontSize: 13, letterSpacing: "0.26em", fontWeight: 400, color: "#fff" }}>
          YASSINE&apos;S&nbsp;LENS
        </span>
        <Link
          href="/"
          data-cursor="Close"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(255,255,255,0.8)",
            cursor: "none",
            textDecoration: "none",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: 10,
            fontWeight: 300,
            letterSpacing: "0.1em",
          }}
        >
          Back
          <span
            style={{
              width: 38, height: 38,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, lineHeight: 1,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >×</span>
        </Link>
      </header>

      {/* Project title + description banner */}
      <div
        style={{
          position: "fixed",
          top: 78,
          left: 0,
          right: 0,
          zIndex: 230,
          padding: "10px 28px 12px",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
              fontSize: 10,
              fontWeight: 300,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            {CAT_LABEL[project.cat] || project.cat}
          </span>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(18px, 2.4vw, 28px)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              color: "rgba(255,255,255,0.85)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {project.title}
          </h1>
        </div>
        {project.description && (
          <p
            style={{
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
              fontSize: 11,
              fontWeight: 300,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.38)",
              marginTop: 5,
              maxWidth: 500,
            }}
          >
            {project.description}
            {project.instagram && (
              <a
                href={`https://www.instagram.com/${project.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginLeft: 10,
                  color: "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                  pointerEvents: "auto",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                  paddingBottom: 1,
                }}
              >
                {project.instagram.startsWith("@") ? project.instagram : `@${project.instagram}`}
              </a>
            )}
          </p>
        )}
      </div>

      {/* Canvas — photos with no hover cap, click opens lightbox */}
      <div
        onClick={(e) => {
          // Find clicked photo via closest .card
          const card = (e.target as HTMLElement).closest(".card");
          if (!card) return;
          const cards = Array.from(document.querySelectorAll(".card"));
          const idx = cards.indexOf(card as HTMLElement);
          if (idx >= 0 && barePhotos[idx]) setLightbox(photos[idx]);
        }}
      >
        <Canvas photos={barePhotos} paused={!!lightbox} />
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: "fixed",
          bottom: 22,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 200,
          opacity: hint ? 1 : 0,
          transition: "opacity .6s ease",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontSize: 10, fontWeight: 300, letterSpacing: "0.06em", color: "rgba(255,255,255,0.38)" }}>
          Move cursor to the edge — or scroll
        </span>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 400,
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "none",
            animation: "fadeIn .35s ease",
          }}
          data-cursor="Close"
        >
          {/* Title */}
          <div
            style={{
              position: "absolute",
              top: "clamp(80px, 10vh, 120px)",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <p style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
              {CAT_LABEL[project.cat] || project.cat}
            </p>
            <h2
              className="font-serif"
              style={{
                fontSize: "clamp(28px, 4vw, 52px)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {project.title}
            </h2>
          </div>

          {/* Photo */}
          <div
            style={{
              position: "relative",
              width: "min(90vw, 90vh)",
              aspectRatio: `${lightbox.w} / ${lightbox.h}`,
              maxHeight: "65vh",
            }}
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={lightbox.file}
              alt={project.title}
              fill
              sizes="90vw"
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Close hint */}
          <p style={{ position: "absolute", bottom: 28, fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)" }}>
            Click anywhere to close
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </>
  );
}
