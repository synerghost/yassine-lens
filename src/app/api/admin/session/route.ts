import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin";

export async function GET() {
  return NextResponse.json({
    authed: await isAuthed(),
    configured: !!process.env.ADMIN_PASSWORD,
    blob: !!process.env.BLOB_READ_WRITE_TOKEN,
  });
}
