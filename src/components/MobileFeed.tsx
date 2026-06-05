"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/photos";
import PhotoCard from "./PhotoCard";

const WIDTHS = [0.82, 0.74, 0.86, 0.7, 0.8, 0.76];

export default function MobileFeed({ photos }: { photos: Photo[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    ref.current?.querySelectorAll(".reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [photos]);

  useEffect(() => {
    if (activeIdx === null) return;
    const dismiss = () => setActiveIdx(null);
    const t = setTimeout(() => window.addEventListener("touchstart", dismiss, { once: true }), 50);
    return () => clearTimeout(t);
  }, [activeIdx]);

  return (
    <div ref={ref} style={{ padding: "80px 0 160px", position: "relative" }}>
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
              zIndex: isActive ? 999 : i + 1,
              opacity: overlap && !isActive ? 0.82 : 1,
              boxShadow: isActive ? "0 24px 80px rgba(0,0,0,0.8)" : overlap ? "0 18px 60px rgba(0,0,0,0.6)" : "none",
              transitionDelay: `${(i % 3) * 80}ms`,
              transition: "opacity .3s ease, box-shadow .3s ease",
            }}
          >
            <PhotoCard photo={p} sizes="100vw" priority={i < 2} />
          </div>
        );
      })}
    </div>
  );
}
