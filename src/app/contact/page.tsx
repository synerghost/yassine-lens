"use client";

import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--fg)", minHeight: "100vh", paddingTop: "80px" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px clamp(20px, 5vw, 60px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "clamp(40px, 8vw, 80px)",
          alignItems: "center",
        }}
      >
        {/* Text / Form side */}
        <div>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 400,
              marginBottom: 24,
              lineHeight: 1.1,
            }}
          >
            Let's create something
            <br />
            extraordinary
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              lineHeight: 1.8,
              color: "rgba(var(--fg-rgb), 0.7)",
              marginBottom: 32,
            }}
          >
            Whether you're looking to capture a moment, document an event, or showcase your vision, Yassine Zennar brings technical excellence and creative vision to every project.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", marginBottom: 6, color: "rgba(var(--fg-rgb), 0.5)" }}>
                Email
              </label>
              <a
                href="mailto:contact@yassine-lens.com"
                style={{
                  fontSize: "clamp(15px, 2vw, 18px)",
                  color: "var(--fg)",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(var(--fg-rgb), 0.2)",
                }}
              >
                contact@yassine-lens.com
              </a>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", marginBottom: 6, color: "rgba(var(--fg-rgb), 0.5)" }}>
                Instagram
              </label>
              <a
                href="https://instagram.com/yasineslenss"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "clamp(15px, 2vw, 18px)",
                  color: "var(--fg)",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(var(--fg-rgb), 0.2)",
                }}
              >
                @yasineslenss
              </a>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", marginBottom: 6, color: "rgba(var(--fg-rgb), 0.5)" }}>
                Location
              </label>
              <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--fg)", margin: 0 }}>
                Morocco
              </p>
            </div>
          </div>

          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: 40,
              padding: "12px 28px",
              border: "1px solid rgba(var(--fg-rgb), 0.3)",
              borderRadius: 999,
              fontSize: 12,
              letterSpacing: "0.1em",
              textDecoration: "none",
              color: "var(--fg)",
              transition: "all .3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(var(--fg-rgb), 0.08)";
              e.currentTarget.style.borderColor = "rgba(var(--fg-rgb), 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(var(--fg-rgb), 0.3)";
            }}
          >
            ← Back to gallery
          </Link>
        </div>

        {/* Photo side */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "3/4",
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(var(--fg-rgb), 0.05)",
          }}
        >
          <Image
            src="/yassine-portrait.jpg"
            alt="Yassine Zennar — Photographer"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </div>
    </main>
  );
}
