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

/**
 * Homepage order: featured first, then SPORTS (the highlighted category) so it
 * dominates the top of the page, then the other categories interleaved.
 */
export function interleave(photos: Photo[]): Photo[] {
  const featured = FEATURED_SLUGS.map((s) => photos.find((p) => p.slug === s)).filter(Boolean) as Photo[];
  const featuredSet = new Set(featured.map((p) => p.slug));
  const rest = photos.filter((p) => !p.slug || !featuredSet.has(p.slug));

  // Sports come out first (more prominent on the home page).
  const sports = rest.filter((p) => p.cat === "sports");

  // Remaining categories interleaved round-robin so they alternate.
  const others = rest.filter((p) => p.cat !== "sports");
  const otherCats = CATEGORIES.filter((c) => c !== "sports");
  const buckets = otherCats.map((c) => others.filter((p) => p.cat === c));
  const loose = others.filter((p) => !CATEGORIES.includes(p.cat as Category));
  const mixed: Photo[] = [];
  let added = true;
  for (let i = 0; added; i++) {
    added = false;
    for (const b of buckets) {
      if (b[i]) { mixed.push(b[i]); added = true; }
    }
  }
  return [...featured, ...sports, ...mixed, ...loose];
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
 * is no regression. The cover's own dimensions are used so its real format
 * (portrait/landscape) is respected in the mosaic.
 */
export async function getGallery(): Promise<Photo[]> {
  const raw = await getRawGallery();
  try {
    const { getProjects } = await import("./projects");
    const projects = await getProjects();
    const mainBySlug = new Map<string, { file: string; w?: number; h?: number }>();
    for (const p of projects) {
      // Only override when the admin uploaded a new cover (full Blob/HTTP URL).
      if (p.slug && typeof p.main === "string" && p.main.startsWith("http")) {
        mainBySlug.set(p.slug, { file: p.main, w: p.mainW, h: p.mainH });
      }
    }
    // 1) Override existing cards' cover with the project's uploaded main image,
    //    using the cover's own dimensions so its real format (portrait/landscape)
    //    is respected in the mosaic.
    const merged = mainBySlug.size
      ? raw.map((ph) => {
          const m = ph.slug ? mainBySlug.get(ph.slug) : undefined;
          return m ? { ...ph, file: m.file, w: m.w || ph.w, h: m.h || ph.h } : ph;
        })
      : raw.slice();

    // 2) Add cards for newly created projects that have a cover but no gallery
    //    entry yet, so they appear on the homepage after saving.
    const present = new Set(raw.map((ph) => ph.slug).filter(Boolean));
    const extras: Photo[] = projects
      .filter((p) => p.slug && !present.has(p.slug) && typeof p.main === "string" && p.main.startsWith("http"))
      .map((p) => ({
        file: p.main,
        w: p.mainW || 1200,
        h: p.mainH || 1500,
        cat: p.cat,
        title: p.title,
        slug: p.slug,
      }));

    return interleave([...merged, ...extras]);
  } catch {
    /* fall through to plain gallery */
  }
  return interleave(raw);
}

export function aboutImage(): string {
  return bundled.about as string;
}
