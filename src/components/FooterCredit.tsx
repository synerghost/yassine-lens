"use client";

import { useRef } from "react";

export default function FooterCredit() {
  const glowRef = useRef<HTMLSpanElement>(null);

  return (
    <>
      <footer
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 150,
          pointerEvents: "none",
        }}
        className="footer-credit-desktop"
      >
        <a
          href="https://bsstd.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: 11,
            fontWeight: 300,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.42)",
            textDecoration: "none",
            pointerEvents: "auto",
            whiteSpace: "nowrap",
            position: "relative",
            display: "inline-block",
            transition: "color .3s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "rgba(255,255,255,0.9)";
            if (glowRef.current) glowRef.current.style.opacity = "1";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "rgba(255,255,255,0.42)";
            if (glowRef.current) glowRef.current.style.opacity = "0";
          }}
        >
          <span
            ref={glowRef}
            style={{
              position: "absolute",
              inset: "-18px -30px",
              background: "radial-gradient(ellipse at 50% 120%, rgba(255,255,200,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
              opacity: 0,
              transition: "opacity .35s ease",
              borderRadius: "50%",
            }}
          />
          Site créé par Base Studio
        </a>
      </footer>

      {/* Mobile version: above the filter bar, larger + more visible */}
      <footer
        style={{
          position: "fixed",
          bottom: 96,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 150,
          pointerEvents: "none",
        }}
        className="footer-credit-mobile"
      >
        <a
          href="https://bsstd.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: 12,
            fontWeight: 300,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.52)",
            textDecoration: "none",
            pointerEvents: "auto",
            whiteSpace: "nowrap",
            display: "inline-block",
            padding: "8px 12px",
          }}
        >
          Site créé par Base Studio
        </a>
      </footer>

      <style>{`
        .footer-credit-mobile { display: none; }
        @media (hover: none), (pointer: coarse) {
          .footer-credit-desktop { display: none; }
          .footer-credit-mobile { display: block; }
        }
      `}</style>
    </>
  );
}
