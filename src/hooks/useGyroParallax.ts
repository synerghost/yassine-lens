"use client";

import { useEffect, useRef } from "react";

/**
 * Returns a ref to attach to a container div.
 * On deviceorientation (Android auto, iOS after first touch), applies
 * a subtle 3D parallax shift — mimics Apple dynamic wallpaper depth.
 */
export function useGyroParallax(strength = 10) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("DeviceOrientationEvent" in window)) return;

    let smoothX = 0, smoothY = 0;
    let targetX = 0, targetY = 0;
    let raf = 0;
    let listening = false;

    const onOrientation = (e: DeviceOrientationEvent) => {
      const gamma = Math.max(-35, Math.min(35, e.gamma ?? 0));
      const beta  = Math.max(-35, Math.min(35, (e.beta ?? 0) - 30));
      targetX = (gamma / 35) * strength;
      targetY = (beta  / 35) * strength;
    };

    const startListening = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("deviceorientation", onOrientation, { passive: true });
      const loop = () => {
        smoothX += (targetX - smoothX) * 0.07;
        smoothY += (targetY - smoothY) * 0.07;
        if (el) el.style.transform = `translate3d(${smoothX.toFixed(2)}px, ${smoothY.toFixed(2)}px, 0)`;
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = DeviceOrientationEvent as any;

    if (typeof DOE.requestPermission === "function") {
      // iOS 13+: need user gesture → request on first touch
      const onTouch = async () => {
        try {
          const res = await DOE.requestPermission();
          if (res === "granted") startListening();
        } catch { /* denied */ }
        window.removeEventListener("touchstart", onTouch);
      };
      window.addEventListener("touchstart", onTouch, { once: true, passive: true });
    } else {
      // Android / non-iOS: start immediately
      startListening();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, [strength]);

  return ref;
}
