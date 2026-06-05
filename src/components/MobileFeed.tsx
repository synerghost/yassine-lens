"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/photos";
import PhotoCard from "./PhotoCard";

// staggered widths -> the "saccadé" Wanda feel; pairs overlap each other
const WIDTHS = [0.82, 0.74, 0.86, 0.7, 0.8, 0.76];

export default function MobileFeed({ photos }: { photos: Photo[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        }),
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    ref.current?.querySelectorAll(".reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [photos]);

  // Dismiss active card when tapping outside
  useEffect(() => {
    if (activeIdx === null) return;
    const dismiss = () => setActiveIdx(null);
    const t = setTimeout(() => window.addEventListener("touchstart", dismiss, { once: true }), 50);
    return () => clearTimeout(t);
  }, [activeIdx]);

  return (
    <>
    {/* Scroll to top — mobile */}
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        right: 16,
        bottom: 28,
        zIndex: 220,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(18,18,18,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "rgba(255,255,255,0.85)",
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: showTop ? 1 : 0,
        pointerEvents: showTop ? "auto" : "none",
        transition: "opacity .3s ease",
        cursor: "pointer",
      }}
      aria-label="Scroll to top"
    >
      ↑
    </button>
    <div ref={ref} style={{ padding: "114px 0 96px", position: "relative" }}>
      {photos.map((p, i) => {
        const right = i % 2 === 1;
        const overlap = i > 0 && i % 2 === 1;
        const widthPct = Math.round(WIDTHS[i % WIDTHS.length] * 100);
        const isActive = activeIdx === i;

        return (
          <div
            key={p.file + i}
            className={`card reveal${isActive ? " mobile-active" : ""}`}
            data-cursor="View"
            onTouchStart={() => setActiveIdx(i)}
            style={{
              position: "relative",
              width: `${widthPct}%`,
              marginLeft: right ? "auto" : 14,
              marginRight: right ? 14 : "auto",
              marginTop: i === 0 ? 0 : overlap ? "-22vw" : "9vw",
              aspectRatio: `${p.w} / ${p.h}`,
              // Active card flies above everything; overlap cards slightly transparent
              zIndex: isActive ? 999 : i + 1,
              opacity: overlap && !isActive ? 0.82 : 1,
              boxShadow: isActive
                ? "0 24px 80px rgba(0,0,0,0.8)"
                : overlap
                ? "0 18px 60px rgba(0,0,0,0.6)"
                : "none",
              transitionDelay: `${(i % 3) * 80}ms`,
              transition: "opacity .3s ease, z-index 0s, box-shadow .3s ease",
            }}
          >
            <PhotoCard photo={p} sizes="100vw" priority={i < 2} />
          </div>
        );
      })}
    </div>
    </>
  );
}
