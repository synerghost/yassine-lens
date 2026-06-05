"use client";

import { useEffect, useRef } from "react";

/**
 * Apple-wallpaper-style depth parallax via DeviceOrientation.
 * - Android: starts automatically (no permission needed)
 * - iOS 13+: requestPermission() called SYNCHRONOUSLY on first touchstart
 *   (async/await breaks iOS gesture detection — must use .then())
 */
export function useGyroParallax(strength = 14) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("DeviceOrientationEvent" in window)) return;

    let smoothX = 0, smoothY = 0;
    let targetX = 0, targetY = 0;
    let raf = 0;
    let active = false;

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null && e.beta === null) return;
      // gamma = left/right tilt, beta = fwd/back tilt
      // subtract ~30° from beta to account for natural phone hold angle
      const gamma = Math.max(-40, Math.min(40, e.gamma ?? 0));
      const beta  = Math.max(-40, Math.min(40, (e.beta ?? 0) - 30));
      targetX = (gamma / 40) * strength;
      targetY = (beta  / 40) * strength * 0.6;
    };

    const start = () => {
      if (active) return;
      active = true;
      window.addEventListener("deviceorientation", onOrientation, { passive: true });
      const tick = () => {
        smoothX += (targetX - smoothX) * 0.06;
        smoothY += (targetY - smoothY) * 0.06;
        if (ref.current) {
          ref.current.style.transform =
            `translate3d(${smoothX.toFixed(2)}px, ${smoothY.toFixed(2)}px, 0)`;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = DeviceOrientationEvent as any;

    if (typeof DOE.requestPermission === "function") {
      // iOS 13+ — requestPermission() MUST be called synchronously inside a user gesture.
      // Using .then() keeps the calling function non-async → iOS accepts it as a gesture.
      const onFirstTouch = () => {
        DOE.requestPermission()
          .then((result: string) => { if (result === "granted") start(); })
          .catch(() => {/* user denied */});
      };
      window.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });
    } else {
      // Android & non-permission browsers — start right away
      start();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, [strength]);

  return ref;
}
