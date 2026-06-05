import type { Metadata } from "next";
import "./globals.css";
import Cursor from "@/components/Cursor";
import FooterCredit from "@/components/FooterCredit";
import ThemeProvider from "@/components/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* display=swap on all fonts — non-blocking FOUT instead of FOIT */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@300;400&display=swap"
          rel="stylesheet"
        />
        {/* dns-prefetch for Vercel Blob CDN */}
        <link rel="dns-prefetch" href="https://public.blob.vercel-storage.com" />
        {/* Prevent flash of wrong theme — runs before React hydrates */}
        {/* Prevent flash of wrong theme + expose to ThemeProvider (no re-render needed) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')==='light'?'light':'dark';document.documentElement.setAttribute('data-theme',t);window.__THEME__=t})()`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <Cursor />
          {children}
          <FooterCredit />
        </ThemeProvider>
      </body>
    </html>
  );
}
