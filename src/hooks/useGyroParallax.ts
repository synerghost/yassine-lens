"use client";

import { useEffect, useRef } from "react";

/**
 * Apple-wallpaper-style depth parallax via DeviceOrientation.
 * - Android: starts automatically (no permission needed)
 * - iOS 13+: requestPermission() called synchronously inside touchstart
 *   (.then() keeps the function non-async so iOS sees it as a user gesture)
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
        if (ref.current)
          ref.current.style.transform = `translate3d(${smoothX.toFixed(2)}px, ${smoothY.toFixed(2)}px, 0)`;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = DeviceOrientationEvent as any;

    // Cleanup ref for the touchstart listener (fixes memory leak on unmount)
    let onFirstTouch: (() => void) | null = null;

    if (typeof DOE.requestPermission === "function") {
      // iOS 13+: must call requestPermission() synchronously inside a user gesture.
      // Using .then() (not async/await) keeps the function synchronous for iOS.
      onFirstTouch = () => {
        DOE.requestPermission()
          .then((result: string) => { if (result === "granted") start(); })
          .catch(() => {});
      };
      window.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });
    } else {
      start();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onOrientation);
      // Fix memory leak: always remove touchstart listener on cleanup
      if (onFirstTouch) window.removeEventListener("touchstart", onFirstTouch);
    };
  }, [strength]);

  return ref;
}
