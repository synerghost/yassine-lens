"use client";

export default function FooterCredit() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 150,
        pointerEvents: "none",
      }}
    >
      <a
        href="https://bsstd.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.22)",
          textDecoration: "none",
          pointerEvents: "auto",
          whiteSpace: "nowrap",
          transition: "color .25s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}
      >
        Site créé par Base Studio
      </a>
    </footer>
  );
}
