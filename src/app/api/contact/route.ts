import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// Escape user input so it can't inject HTML into the email body.
const esc = (s: unknown) =>
  String(s ?? "").replace(/[<>&"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string),
  );

/**
 * Contact form -> email via ImprovMX SMTP (premium).
 *
 * Env vars (set in Vercel):
 *  - SMTP_HOST  : default "smtp.improvmx.com"
 *  - SMTP_PORT  : default "587" (587 = STARTTLS, 465 = SSL)
 *  - SMTP_USER  : ImprovMX SMTP login, e.g. "contact@yassine-lens.com"
 *  - SMTP_PASS  : ImprovMX SMTP password (from the ImprovMX dashboard)
 *  - CONTACT_TO : where to receive requests (default the client's Gmail)
 *  - CONTACT_FROM (optional) : display sender, default "Yassine's Lens <SMTP_USER>"
 */
export async function POST(req: Request): Promise<NextResponse> {
  const host = process.env.SMTP_HOST || "smtp.improvmx.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO || "hustleryasszr@gmail.com";
  const from = process.env.CONTACT_FROM || `Yassine's Lens <${user ?? "contact@yassine-lens.com"}>`;

  if (!user || !pass) {
    return NextResponse.json(
      { error: "SMTP non configuré (SMTP_USER / SMTP_PASS manquant)." },
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
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS (secure:false)
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to,
      replyTo: email.trim(),
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Échec de l'envoi." },
      { status: 502 },
    );
  }
}
