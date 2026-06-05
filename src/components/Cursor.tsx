"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Cursor() {
  const pathname = usePathname();
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const disabled = pathname?.startsWith("/admin");

  useEffect(() => {
    if (disabled) return;
    const dot = dotRef.current!;
    const label = labelRef.current!;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x, ty = y;
    let raf = 0;
    let running = false;

    const render = () => {
      tx += (x - tx) * 0.35;
      ty += (y - ty) * 0.35;
      dot.style.transform   = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
      label.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
      // Exit loop once cursor has settled — avoids burning 60fps when idle
      if (Math.abs(x - tx) > 0.1 || Math.abs(y - ty) > 0.1) {
        raf = requestAnimationFrame(render);
      } else {
        running = false;
      }
    };

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      // Restart RAF only when it stopped
      if (!running) { running = true; raf = requestAnimationFrame(render); }
      const hov = (e.target as HTMLElement)?.closest("[data-cursor]");
      if (hov) {
        dot.classList.add("active");
        label.textContent = hov.getAttribute("data-cursor") || "View";
        label.classList.add("active");
      } else {
        dot.classList.remove("active");
        label.classList.remove("active");
      }
    };
    window.addEventListener("mousemove", move);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={labelRef} className="cursor-label" />
    </>
  );
}
