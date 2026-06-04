import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_COOKIE = "yl_admin";

/** Deterministic session token derived from the admin password. */
export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return crypto.createHash("sha256").update(`${pw}:yasines-lens`).digest("hex");
}

export async function isAuthed(): Promise<boolean> {
  const token = adminToken();
  if (!token) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === token;
}
