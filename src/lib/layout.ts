import type { Photo } from "./photos";

export type Placed = Photo & { x: number; y: number; width: number; height: number };

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Dense, asymmetric generative grid (Wanda-style) via skyline best-fit packing.
 * Cards keep their aspect ratio; widths vary so the result feels scattered.
 */
export function buildLayout(photos: Photo[], W: number, seed = 7) {
  const rng = mulberry32(seed);
  const FINE = 48;
  const unit = W / FINE;
  const gapX = W * 0.018;
  const gapY = Math.max(38, W * 0.036);
  const skyline = new Array(FINE).fill(0);
  const baseH = Math.min(Math.max(W * 0.25, 300), 460);
  const minW = W * 0.22;
  const maxW = W * 0.52;
  const placed: Placed[] = [];

  photos.forEach((p, i) => {
    const feature = i % 9 === 0;
    const th = baseH * (0.9 + rng() * 0.26) * (feature ? 1.16 : 1);
    const r = p.w / p.h;
    let width = Math.min(Math.max(th * r, minW), maxW);
    let span = Math.min(Math.max(7, Math.round(width / unit)), FINE - 2);
    width = span * unit - gapX;
    const height = width / r;

    let bestStart = 0;
    let bestTop = Infinity;
    for (let s = 0; s <= FINE - span; s++) {
      let top = 0;
      for (let c = s; c < s + span; c++) top = Math.max(top, skyline[c]);
      if (top < bestTop - 0.5) {
        bestTop = top;
        bestStart = s;
      }
    }
    const x = bestStart * unit + gapX / 2;
    const y = bestTop + gapY;
    placed.push({ ...p, x, y, width, height });
    for (let c = bestStart; c < bestStart + span; c++) skyline[c] = y + height;
  });

  const height = Math.max(...skyline, 0) + gapY;
  return { placed, height };
}
