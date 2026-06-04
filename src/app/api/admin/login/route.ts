import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminToken } from "@/lib/admin";

export async function POST(req: Request) {
  const { username, password } = await req
    .json()
    .catch(() => ({ username: "", password: "" }));
  const pw = process.env.ADMIN_PASSWORD;
  const user = process.env.ADMIN_USER || "admin";
  if (!pw) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 500 }
    );
  }
  if (username !== user || password !== pw) {
    return NextResponse.json({ error: "Identifiant ou mot de passe incorrect." }, { status: 401 });
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, adminToken()!, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}
