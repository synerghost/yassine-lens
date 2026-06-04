"use client";

import { useEffect, useRef } from "react";
import type { Photo } from "@/lib/photos";
import PhotoCard from "./PhotoCard";

// staggered widths -> the "saccadé" Wanda feel; pairs overlap each other
const WIDTHS = [0.82, 0.74, 0.86, 0.7, 0.8, 0.76];

export default function MobileFeed({ photos }: { photos: Photo[] }) {
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} style={{ padding: "132px 0 96px", position: "relative" }}>
      {photos.map((p, i) => {
        const right = i % 2 === 1;
        const overlap = i > 0 && i % 2 === 1; // odd cards ride up onto the previous one
        const widthPct = Math.round(WIDTHS[i % WIDTHS.length] * 100);
        return (
          <div
            key={p.file + i}
            className="card reveal"
            data-cursor="View"
            style={{
              position: "relative",
              width: `${widthPct}%`,
              marginLeft: right ? "auto" : 14,
              marginRight: right ? 14 : "auto",
              // negative top margin => the card overlaps (superimposes) the previous one
              marginTop: i === 0 ? 0 : overlap ? "-22vw" : "9vw",
              aspectRatio: `${p.w} / ${p.h}`,
              zIndex: i + 1,
              boxShadow: overlap ? "0 18px 60px rgba(0,0,0,0.6)" : "none",
              transitionDelay: `${(i % 3) * 80}ms`,
            }}
          >
            <PhotoCard photo={p} sizes="100vw" priority={i < 2} />
          </div>
        );
      })}
    </div>
  );
}
