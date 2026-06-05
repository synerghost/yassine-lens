import type { Metadata } from "next";
import "./globals.css";
import Cursor from "@/components/Cursor";

export const metadata: Metadata = {
  title: "Yassine's Lens — Yassine Zennar · Photographer",
  description:
    "Yassine Zennar (Yassine's Lens) — photographer capturing music, hospitality and sport across Morocco. Book a session.",
  openGraph: {
    title: "Yassine's Lens — Yassine Zennar · Photographer",
    description: "Music · Hospitality · Sport — photography by Yassine Zennar, Morocco.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Cursor />
        {children}
        <footer style={{
          position: "fixed",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          pointerEvents: "none",
        }}>
          <a
            href="https://basestudio.fr"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
              textDecoration: "none",
              pointerEvents: "auto",
              transition: "color .2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >
            Site créé par Base Studio
          </a>
        </footer>
      </body>
    </html>
  );
}
