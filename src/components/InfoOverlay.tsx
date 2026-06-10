"use client";

import { useState } from "react";

const services = [
  "Nightlife / Club",
  "Concert & Festival",
  "Motorsport / Rally",
  "Sports & Action",
  "Event Coverage",
  "Portrait Session",
  "Other",
];

export default function InfoOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", service: "", date: "", message: "", company: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Échec de l'envoi. Réessayez.");
      setSent(true);
      setForm({ name: "", email: "", service: "", date: "", message: "", company: "" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      aria-hidden={!open}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(8,8,8,0.96)",
        backdropFilter: "blur(8px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity .5s ease",
        overflowY: "auto",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px clamp(20px,5vw,64px) 80px" }}>
        <div
          className="info-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,6vw,90px)" }}
        >
          {/* About */}
          <div>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--red)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Yassine&apos;s Lens
            </span>
            <h2 className="font-serif" style={{ fontSize: "clamp(40px,5vw,76px)", lineHeight: 0.98, fontWeight: 400, marginTop: 18, letterSpacing: "-0.02em" }}>
              Yassine <span style={{ fontStyle: "italic", color: "var(--red)" }}>Zennar</span>
            </h2>
            <p style={{ marginTop: 26, fontSize: 15, lineHeight: 1.9, color: "var(--muted)", maxWidth: 460 }}>
              Photographer based in Morocco. I capture music, hospitality and sport with
              authenticity, style and artistic depth — from live stages and festivals to
              refined venues and the decisive moment of competition.
            </p>

            <div style={{ marginTop: 44 }}>
              <p className="font-mono" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 18 }}>
                Contact
              </p>
              {[
                { l: "Email", v: "contact@yassine-lens.com", h: "mailto:contact@yassine-lens.com" },
                { l: "Phone", v: "0772 905 020", h: "tel:+212772905020" },
                { l: "Instagram", v: "@yasines_lens", h: "https://www.instagram.com/yasines_lens/" },
                { l: "LinkedIn", v: "Yassine Zennar", h: "https://www.linkedin.com/in/yassine-zennar-216244380/" },
              ].map((c) => (
                <a
                  key={c.l}
                  href={c.h}
                  target={c.h.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  data-cursor="Open"
                  style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid var(--line)" }}
                >
                  <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)" }}>{c.l}</span>
                  <span style={{ fontSize: 14 }}>{c.v}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Booking */}
          <div>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--red)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Book a session
            </span>
            <h3 className="font-serif" style={{ fontSize: "clamp(32px,3.5vw,52px)", lineHeight: 1, fontWeight: 400, marginTop: 18, marginBottom: 30 }}>
              Let&apos;s <span style={{ fontStyle: "italic", color: "var(--red)" }}>create</span>
            </h3>

            {sent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span className="font-serif" style={{ fontSize: 36, fontStyle: "italic" }}>Thank you.</span>
                <p style={{ fontSize: 14, color: "var(--muted)" }}>Your request has been sent — Yassine will get back to you shortly.</p>
                <button onClick={() => setSent(false)} className="btn" style={{ alignSelf: "flex-start", marginTop: 8 }}>Send another</button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <select
                  required
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  style={{ color: form.service ? "var(--fg)" : "var(--faint)", fontSize: 12, letterSpacing: "0.06em", padding: "14px 0", cursor: "pointer" }}
                >
                  <option value="" disabled>Type of photography</option>
                  {services.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input placeholder="Event date / timeframe" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <textarea placeholder="Tell me about your event…" rows={4} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ resize: "none" }} />
                {/* Honeypot: hidden from users, catches bots */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                  aria-hidden="true"
                />
                {error && <p style={{ fontSize: 13, color: "#ff8080" }}>{error}</p>}
                <button type="submit" className="btn" style={{ alignSelf: "flex-start", opacity: sending ? 0.6 : 1 }} data-cursor="Send" disabled={sending}>
                  {sending ? "Sending…" : "Send request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        data-cursor="Close"
        aria-label="Close"
        style={{
          position: "fixed",
          top: 22,
          right: "clamp(20px,4vw,56px)",
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid var(--line)",
          background: "transparent",
          color: "var(--fg)",
          fontSize: 18,
          lineHeight: 1,
          cursor: "none",
        }}
      >
        ×
      </button>

      <style>{`
        @media (max-width: 760px) {
          .info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
