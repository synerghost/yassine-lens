import type { Metadata } from "next";
import "./globals.css";
import Cursor from "@/components/Cursor";

export const metadata: Metadata = {
  title: "Yasines Lens — Yassine Zennar · Photographer",
  description:
    "Yassine Zennar (Yasines Lens) — photographer capturing music, hospitality and sport across Morocco. Book a session.",
  openGraph: {
    title: "Yasines Lens — Yassine Zennar · Photographer",
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
      </body>
    </html>
  );
}
