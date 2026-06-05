import bundled from "@/photos.json";
import { CATEGORIES, type Category } from "./categories";

export { CATEGORIES, CAT_LABEL, type Category } from "./categories";

export type Photo = {
  file: string;
  w: number;
  h: number;
  cat: string;
  title: string;
  slug?: string;
};

const GALLERY_BLOB = "gallery.json";

const FEATURED_SLUGS = [
  "rally-africa-eco-race",
  "surf-wsl",
  "federation-royale-marocaine-de-golf-hassan-ii-trophy",
  "federation-royale-marocaine-des-sports-equestres-morocco-royal-tour",
];

/** Keep featured photos first, then mix categories for the rest. */
export function interleave(photos: Photo[]): Photo[] {
  const featured = FEATURED_SLUGS.map((s) => photos.find((p) => p.slug === s)).filter(Boolean) as Photo[];
  const rest = photos.filter((p) => !p.slug || !FEATURED_SLUGS.includes(p.slug));

  const buckets = CATEGORIES.map((c) => rest.filter((p) => p.cat === c));
  const loose = rest.filter((p) => !CATEGORIES.includes(p.cat as Category));
  const mixed: Photo[] = [];
  let added = true;
  for (let i = 0; added; i++) {
    added = false;
    for (const b of buckets) {
      if (b[i]) { mixed.push(b[i]); added = true; }
    }
  }
  return [...featured, ...mixed, ...loose];
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

/**
 * Public gallery for the homepage.
 *
 * The card cover for each project is driven by the project's `main` image
 * whenever it has been changed in the admin (i.e. it points to an uploaded
 * Blob URL). Untouched projects keep their original gallery photo, so there
 * is no regression. The gallery photo's stored w/h are kept for the masonry
 * layout — the new cover is simply object-fit: cover cropped into that slot.
 */
export async function getGallery(): Promise<Photo[]> {
  const raw = await getRawGallery();
  try {
    const { getProjects } = await import("./projects");
    const projects = await getProjects();
    const mainBySlug = new Map<string, string>();
    for (const p of projects) {
      // Only override when the admin uploaded a new cover (full Blob/HTTP URL).
      if (p.slug && typeof p.main === "string" && p.main.startsWith("http")) {
        mainBySlug.set(p.slug, p.main);
      }
    }
    if (mainBySlug.size) {
      const merged = raw.map((ph) =>
        ph.slug && mainBySlug.has(ph.slug) ? { ...ph, file: mainBySlug.get(ph.slug)! } : ph
      );
      return interleave(merged);
    }
  } catch {
    /* fall through to plain gallery */
  }
  return interleave(raw);
}

export function aboutImage(): string {
  return bundled.about as string;
}
