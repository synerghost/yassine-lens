import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/admin";
import { getRawGallery, CATEGORIES, type Photo } from "@/lib/photos";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ photos: await getRawGallery() });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 500 });
  }
  const body = await req.json().catch(() => null);
  const incoming = body?.photos;
  if (!Array.isArray(incoming)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const clean: Photo[] = incoming
    .filter((p: Photo) => p && typeof p.file === "string")
    .map((p: Photo) => ({
      file: p.file,
      w: Number(p.w) || 1000,
      h: Number(p.h) || 1000,
      cat: (CATEGORIES as readonly string[]).includes(p.cat) ? p.cat : "nightlife",
      title: (p.title || "Untitled").toString().slice(0, 120),
    }));

  // delete any uploaded blobs that were removed from the gallery
  try {
    const previous = await getRawGallery();
    const keep = new Set(clean.map((p) => p.file));
    const orphans = previous
      .map((p) => p.file)
      .filter((u) => !keep.has(u) && u.includes(".blob.vercel-storage.com/"));
    if (orphans.length) await del(orphans);
  } catch {
    /* non-fatal */
  }

  await put("gallery.json", JSON.stringify(clean), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
  revalidatePath("/");
  return NextResponse.json({ ok: true, count: clean.length });
}
