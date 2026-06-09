import projectsData from "./projects.json";

export type SecondaryPhoto = { file: string; w: number; h: number };

export type Project = {
  cat: string;
  title: string;
  slug: string;
  main: string;
  mainW?: number;
  mainH?: number;
  folder?: string;
  instagram?: string;
  description?: string;
  secondaryPhotos: SecondaryPhoto[];
};

const PROJECTS_BLOB = "projects.json";

// Instagram handles are code-managed (verified with the client). Overlaid onto
// whatever is loaded — by slug — so the correct @handles always show, even for
// projects that exist only in Blob (e.g. "slalomania") or have empty values.
const IG_BY_SLUG: Record<string, string> = {
  "moga-festival": "mogafestival",
  "ovul-festival": "ovul.sphere",
  "talguitart-festival": "talguitart",
  "ironman-morocco": "ironmanmorocco",
  "rally-africa-eco-race": "africaecorace",
  "federation-royale-marocaine-de-golf-hassan-ii-trophy": "frmgolf",
  "federation-royale-marocaine-des-sports-equestres-morocco-royal-tour": "frmse_ma",
  "amouag-taghazout": "fairmonttaghazoutbayresort",
  "slalomania": "slalo_mania",
};

function applyStaticInstagram(projects: Project[]): Project[] {
  return projects.map((p) => {
    const ig = IG_BY_SLUG[p.slug];
    return ig ? { ...p, instagram: ig } : p;
  });
}

/**
 * Read projects from Blob storage (admin-edited, order preserved) when
 * configured, otherwise fall back to the bundled static JSON.
 * This mirrors getRawGallery() in photos.ts so public project pages
 * reflect admin changes (reordering, main image, descriptions, etc.).
 * Instagram handles are overlaid from code (see STATIC_IG).
 */
export async function getProjects(): Promise<Project[]> {
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: PROJECTS_BLOB });
      const found = blobs.find((b) => b.pathname === PROJECTS_BLOB);
      if (found) {
        const res = await fetch(found.url, { next: { revalidate: 20 } });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) return applyStaticInstagram(data as Project[]);
        }
      }
    }
  } catch {
    /* fall through to bundled static JSON */
  }
  return applyStaticInstagram(projectsData as Project[]);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}
