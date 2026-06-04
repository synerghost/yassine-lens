import bundled from "@/photos.json";
import { CATEGORIES, type Category } from "./categories";

export { CATEGORIES, CAT_LABEL, type Category } from "./categories";

export type Photo = {
  file: string;
  w: number;
  h: number;
  cat: string;
  title: string;
};

const GALLERY_BLOB = "gallery.json";

/** Mix the categories so the single canvas alternates styles (Wanda-style feed). */
export function interleave(photos: Photo[]): Photo[] {
  const buckets = CATEGORIES.map((c) => photos.filter((p) => p.cat === c));
  const loose = photos.filter((p) => !CATEGORIES.includes(p.cat as Category));
  const out: Photo[] = [];
  let added = true;
  for (let i = 0; added; i++) {
    added = false;
    for (const b of buckets) {
      if (b[i]) {
        out.push(b[i]);
        added = true;
      }
    }
  }
  return [...out, ...loose];
}

/** Raw stored list (admin order preserved). Blob if configured, else bundled. */
export async function getRawGallery(): Promise<Photo[]> {
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: GALLERY_BLOB });
      const found = blobs.find((b) => b.pathname === GALLERY_BLOB);
      if (found) {
        const res = await fetch(found.url, { next: { revalidate: 20 } });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) return data as Photo[];
        }
      }
    }
  } catch {
    /* fall through to bundled placeholders */
  }
  return (bundled.photos as Photo[]) ?? [];
}

/** Public, interleaved gallery for the homepage. */
export async function getGallery(): Promise<Photo[]> {
  return interleave(await getRawGallery());
}

export function aboutImage(): string {
  return bundled.about as string;
}
