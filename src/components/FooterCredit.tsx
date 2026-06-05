"use client";

export default function FooterCredit() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 14,
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
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          fontSize: 10,
          fontWeight: 300,
          letterSpacing: "0.06em",
          color: "rgba(255,255,255,0.38)",
          textDecoration: "none",
          pointerEvents: "auto",
          whiteSpace: "nowrap",
          transition: "color .25s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
      >
        Site créé par Base Studio
      </a>
    </footer>
  );
}
