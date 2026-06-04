"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/photos";
import { buildLayout, type Placed } from "@/lib/layout";
import PhotoCard from "./PhotoCard";

/**
 * One giant fixed canvas (Wanda-style). Custom scroll engine:
 *  - wheel scrolls vertically,
 *  - cursor near the top/bottom edge auto-scrolls,
 *  - cursor x gently pans the wider-than-viewport canvas (side bleed).
 */
export default function DesktopCanvas({
  photos,
  paused,
}: {
  photos: Photo[];
  paused: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [contentH, setContentH] = useState(0);
  const [contentW, setContentW] = useState(0);
  const [ready, setReady] = useState(false);

  const target = useRef(0);
  const current = useRef(0);
  const mouseY = useRef<number | null>(null);
  const mouseX = useRef<number | null>(null);
  const maxScroll = useRef(0);
  const overflowX = useRef(0);
  const targetX = useRef(0);
  const currentX = useRef(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const compute = () => {
    const el = viewportRef.current;
    if (!el) return;
    const W = el.clientWidth;
    const innerW = Math.round(W * 1.22); // wider than viewport -> side bleed
    const { placed, height } = buildLayout(photos, innerW, 7);
    setPlaced(placed);
    setContentH(height);
    setContentW(innerW);
    maxScroll.current = Math.max(0, height - window.innerHeight);
    overflowX.current = innerW - W;
    targetX.current = -overflowX.current / 2;
    currentX.current = -overflowX.current / 2;
    setReady(true);
  };

  useLayoutEffect(() => {
    compute();
    const ro = new ResizeObserver(() => compute());
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    document.body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return;
      target.current = Math.min(Math.max(target.current + e.deltaY, 0), maxScroll.current);
    };
    const onMove = (e: MouseEvent) => {
      mouseY.current = e.clientY;
      mouseX.current = e.clientX;
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        mouseY.current = null;
        mouseX.current = null;
      }
    };
    const onBlur = () => {
      mouseY.current = null;
      mouseX.current = null;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("blur", onBlur);

    let raf = 0;
    const EDGE_MAX = 18;
    const loop = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      if (!pausedRef.current && mouseY.current != null) {
        const y = mouseY.current;
        const bottomZone = vh * 0.8;
        const topZone = vh * 0.2;
        if (y > bottomZone) {
          const f = (y - bottomZone) / (vh - bottomZone);
          target.current = Math.min(target.current + f * EDGE_MAX, maxScroll.current);
        } else if (y < topZone) {
          const f = (topZone - y) / topZone;
          target.current = Math.max(target.current - f * EDGE_MAX, 0);
        }
      }
      const ovx = overflowX.current;
      if (ovx > 0 && !pausedRef.current && mouseX.current != null) {
        const fx = mouseX.current / vw;
        targetX.current = -ovx * (0.18 + 0.64 * fx);
      }
      current.current += (target.current - current.current) * 0.09;
      if (Math.abs(target.current - current.current) < 0.05) current.current = target.current;
      currentX.current += (targetX.current - currentX.current) * 0.06;
      track.style.transform = `translate3d(${currentX.current}px, ${-current.current}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("blur", onBlur);
    };
  }, [placed, contentH]);

  useEffect(() => {
    if (ready)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (trackRef.current) trackRef.current.style.opacity = "1";
        })
      );
  }, [ready]);

  return (
    <div ref={viewportRef} style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 1 }}>
      <div
        ref={trackRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: contentW || "100%",
          height: contentH,
          willChange: "transform",
          opacity: 0,
          transition: "opacity 1s ease",
        }}
      >
        {placed.map((p, i) => (
          <div
            key={p.file + i}
            className="card"
            data-cursor="View"
            style={{ left: p.x, top: p.y, width: p.width, height: p.height }}
          >
            <PhotoCard photo={p} priority={i < 6} />
          </div>
        ))}
      </div>
    </div>
  );
}
