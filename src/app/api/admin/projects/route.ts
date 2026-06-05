import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/admin";
import projectsData from "@/lib/projects.json";

const PROJECTS_BLOB = "projects.json";

type ProjectEntry = {
  cat: string;
  title: string;
  slug: string;
  main: string;
  folder: string;
  instagram: string;
  description: string;
  secondaryPhotos: { file: string; w: number; h: number }[];
};

async function getProjects(): Promise<ProjectEntry[]> {
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: PROJECTS_BLOB });
      const found = blobs.find((b) => b.pathname === PROJECTS_BLOB);
      if (found) {
        const res = await fetch(found.url, { next: { revalidate: 20 } });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) return data;
        }
      }
    }
  } catch { /* fall through */ }
  return projectsData as ProjectEntry[];
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ projects: await getProjects() });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: "Blob storage not configured." }, { status: 500 });

  const body = await req.json().catch(() => null);
  const incoming = body?.projects;
  if (!Array.isArray(incoming)) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const clean: ProjectEntry[] = incoming.map((p: ProjectEntry) => ({
    cat: p.cat || "sports",
    title: (p.title || "").toString().slice(0, 120),
    slug: (p.slug || "").toString(),
    main: (p.main || "").toString(),
    folder: (p.folder || "").toString(),
    instagram: (p.instagram || "").toString().slice(0, 60),
    description: (p.description || "").toString().slice(0, 500),
    secondaryPhotos: Array.isArray(p.secondaryPhotos) ? p.secondaryPhotos : [],
  }));

  await put(PROJECTS_BLOB, JSON.stringify(clean), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  revalidatePath("/");
  clean.forEach((p) => revalidatePath(`/projects/${p.slug}`));

  return NextResponse.json({ ok: true, count: clean.length });
}
