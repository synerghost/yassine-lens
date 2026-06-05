import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_COOKIE = "yl_admin";

/**
 * Session token derived from the admin password + a deployment-specific salt.
 * Using HMAC (vs raw SHA256) + salt means a leaked cookie from one deployment
 * is useless on another. timingSafeEqual prevents timing attacks on comparison.
 */
export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  const salt = process.env.TOKEN_SECRET || "yasines-lens-v1";
  return crypto.createHmac("sha256", salt).update(pw).digest("hex");
}

export async function isAuthed(): Promise<boolean> {
  const token = adminToken();
  if (!token) return false;
  const store = await cookies();
  const cookie = store.get(ADMIN_COOKIE)?.value;
  if (!cookie || cookie.length !== token.length) return false;
  // Constant-time comparison — prevents timing side-channel attacks
  return crypto.timingSafeEqual(Buffer.from(cookie, "hex"), Buffer.from(token, "hex"));
}
