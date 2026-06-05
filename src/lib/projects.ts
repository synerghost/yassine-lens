import projectsData from "./projects.json";

export type SecondaryPhoto = { file: string; w: number; h: number };

export type Project = {
  cat: string;
  title: string;
  slug: string;
  main: string;
  folder?: string;
  instagram?: string;
  description?: string;
  secondaryPhotos: SecondaryPhoto[];
};

const PROJECTS_BLOB = "projects.json";

/**
 * Read projects from Blob storage (admin-edited, order preserved) when
 * configured, otherwise fall back to the bundled static JSON.
 * This mirrors getRawGallery() in photos.ts so public project pages
 * reflect admin changes (reordering, main image, descriptions, etc.).
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
          if (Array.isArray(data) && data.length) return data as Project[];
        }
      }
    }
  } catch {
    /* fall through to bundled static JSON */
  }
  return projectsData as Project[];
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}
