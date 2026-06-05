import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthed } from "@/lib/admin";

/**
 * Client-side upload token endpoint.
 *
 * The browser uploads the file DIRECTLY to Vercel Blob (via @vercel/blob/client
 * `upload()`), which bypasses the 4.5 MB serverless request-body limit that was
 * causing large photos to fail with "Failed to upload". This route only issues
 * a short-lived upload token after checking the admin session.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 500 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Cookies are sent on this initial request, so the session is valid here.
        if (!(await isAuthed())) {
          throw new Error("Unauthorized");
        }
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/heic",
            "image/heif",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
        };
      },
      // Called by Vercel after the upload finishes (production only).
      onUploadCompleted: async () => {
        /* no-op: pages are revalidated when the gallery/projects are saved */
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Upload failed." },
      { status: 400 },
    );
  }
}
