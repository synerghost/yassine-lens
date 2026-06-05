"use client";

import { useEffect, useState } from "react";
import type { Photo } from "@/lib/photos";
import DesktopCanvas from "./DesktopCanvas";
import MobileFeed from "./MobileFeed";

const MOBILE_MAX = 820;

export default function Canvas({ photos, paused, noCap }: { photos: Photo[]; paused: boolean; noCap?: boolean }) {
  const [mode, setMode] = useState<"loading" | "desktop" | "mobile">("loading");

  useEffect(() => {
    // Touch devices (incl. iPad) can't use the wheel/edge-scroll canvas, so they
    // always get the native-scroll feed — regardless of screen width.
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    const apply = () =>
      setMode(isTouch || window.innerWidth < MOBILE_MAX ? "mobile" : "desktop");
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  if (mode === "loading") return null;
  return mode === "mobile" ? (
    <MobileFeed photos={photos} noCap={noCap} />
  ) : (
    <DesktopCanvas photos={photos} paused={paused} noCap={noCap} />
  );
}
