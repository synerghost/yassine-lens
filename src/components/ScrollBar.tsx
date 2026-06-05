"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Vertical scroll progress bar — 3 segments, draggable thumb, click-to-seek.
 * Works with a custom scroll driver (DesktopCanvas) via callbacks.
 */
export default function ScrollBar({
  progress,          // 0 → 1
  onSeek,            // called with new progress 0→1
  onScrollTop,       // called to jump to top
}: {
  progress: number;
  onSeek: (p: number) => void;
  onScrollTop: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [visible, setVisible] = useState(false);

  // Show bar only after a bit of scroll
  useEffect(() => {
    setVisible(progress > 0.01);
  }, [progress]);

  const seekFromEvent = (e: React.MouseEvent | MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    onSeek(p);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) seekFromEvent(e); };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const thumbY = `${progress * 100}%`;

  return (
    <div
      style={{
        position: "fixed",
        right: 18,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 220,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity: visible ? 1 : 0,
        transition: "opacity .4s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Scroll to top */}
      <button
        onClick={onScrollTop}
        data-cursor="Close"
        title="Back to top"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(18,18,18,0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "rgba(255,255,255,0.7)",
          fontSize: 11,
          cursor: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color .2s, color .2s",
        }}
      >
        ↑
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        onClick={seekFromEvent}
        onMouseDown={() => { dragging.current = true; }}
        style={{
          width: 2,
          height: 80,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 2,
          position: "relative",
          cursor: "none",
        }}
      >
        {/* 3 tick segments */}
        {[0, 0.5, 1].map((pos) => (
          <div
            key={pos}
            style={{
              position: "absolute",
              left: -3,
              top: `${pos * 100}%`,
              width: 8,
              height: 1,
              background: "rgba(255,255,255,0.3)",
              transform: "translateY(-50%)",
            }}
          />
        ))}

        {/* Filled portion */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: thumbY,
            background: "rgba(255,255,255,0.7)",
            borderRadius: 2,
            transition: "height .05s linear",
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: thumbY,
            transform: "translate(-50%, -50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 6px rgba(255,255,255,0.5)",
          }}
        />
      </div>
    </div>
  );
}
