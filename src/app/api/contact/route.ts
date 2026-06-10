import { NextResponse } from "next/server";

// Escape user input so it can't inject HTML into the email body.
const esc = (s: unknown) =>
  String(s ?? "").replace(/[<>&"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string),
  );

/**
 * Contact form -> email via the Resend REST API (no SDK dependency).
 *
 * Env vars (set in Vercel):
 *  - RESEND_API_KEY : key from the existing Resend account (same as bsstd.com).
 *  - CONTACT_TO     : where to receive requests (e.g. the client's Gmail).
 *  - CONTACT_FROM   : a verified sender, e.g. "Yassine's Lens <noreply@bsstd.com>"
 *                     or an address on a verified yassine-lens.com domain.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM || "Yassine's Lens <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return NextResponse.json(
      { error: "Service d'email non configuré (RESEND_API_KEY / CONTACT_TO manquant)." },
      { status: 500 },
    );
  }

  const data = await req.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { name, email, service, date, message, company } = data as Record<string, string>;

  // Honeypot: real users never fill this hidden field — silently accept & drop.
  if (company) return NextResponse.json({ ok: true });

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Merci de remplir le nom, l'email et le message." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const subject = `Nouvelle demande — ${service?.trim() || "Photographie"} — ${name.trim()}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111;line-height:1.6">
      <h2 style="margin:0 0 16px">Nouvelle demande de contact</h2>
      <p><strong>Nom :</strong> ${esc(name)}</p>
      <p><strong>Email :</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
      <p><strong>Type de prestation :</strong> ${esc(service) || "—"}</p>
      <p><strong>Date / période :</strong> ${esc(date) || "—"}</p>
      <p style="margin-top:16px"><strong>Message :</strong></p>
      <p style="white-space:pre-wrap">${esc(message)}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
      <p style="font-size:12px;color:#888">Envoyé depuis le formulaire de yassine-lens.com</p>
    </div>
  `;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, reply_to: email.trim() }),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return NextResponse.json({ error: err?.message || "Échec de l'envoi." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Échec de l'envoi." }, { status: 500 });
  }
}
