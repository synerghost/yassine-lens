import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthed } from "@/lib/admin";

/**
 * Dual-mode upload endpoint.
 *
 * - JSON body  -> client-upload token flow (@vercel/blob/client `upload()`).
 *   The browser uploads directly to Blob, so there is NO 4.5 MB serverless
 *   body limit. This is the primary path for full-size photos.
 * - FormData   -> server-side put() fallback for small (normalized) images,
 *   used if the client-upload path is unavailable.
 *
 * Auth is enforced in both paths.
 */
export async function POST(req: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob storage is not configured (BLOB_READ_WRITE_TOKEN missing)." }, { status: 500 });
  }

  const contentType = req.headers.get("content-type") || "";

  // ── Client-upload token flow ────────────────────────────────────────────────
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as HandleUploadBody | null;
    if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    try {
      const jsonResponse = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async () => {
          if (!(await isAuthed())) throw new Error("Unauthorized");
          return {
            allowedContentTypes: [
              "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif",
            ],
            addRandomSuffix: true,
            maximumSizeInBytes: 50 * 1024 * 1024,
          };
        },
        // No onUploadCompleted on purpose: avoids callback-URL derivation, which
        // was the fragile part. Pages are revalidated when the admin saves.
      });
      return NextResponse.json(jsonResponse);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message || "Token error." }, { status: 400 });
    }
  }

  // ── Server-side put() fallback ──────────────────────────────────────────────
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  try {
    const blob = await put(name, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || undefined,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Upload failed." }, { status: 500 });
  }
}
