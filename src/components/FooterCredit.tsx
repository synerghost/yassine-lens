"use client";

import { useRef } from "react";

export default function FooterCredit() {
  const glowRef = useRef<HTMLSpanElement>(null);

  return (
    <>
      <footer className="footer-credit">
        <a
          href="https://bsstd.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-credit-link"
          onMouseEnter={e => {
            e.currentTarget.style.color = "rgba(255,255,255,0.88)";
            if (glowRef.current) glowRef.current.style.opacity = "1";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "";
            if (glowRef.current) glowRef.current.style.opacity = "0";
          }}
        >
          <span
            ref={glowRef}
            style={{
              position: "absolute",
              inset: "-18px -30px",
              background: "radial-gradient(ellipse at 50% 120%, rgba(255,255,200,0.16) 0%, transparent 70%)",
              pointerEvents: "none",
              opacity: 0,
              transition: "opacity .35s ease",
            }}
          />
          Site créé par Base Studio
        </a>
      </footer>

      <style>{`
        .footer-credit {
          position: fixed;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 150;
          pointer-events: none;
        }
        .footer-credit-link {
          font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.42);
          text-decoration: none;
          pointer-events: auto;
          white-space: nowrap;
          position: relative;
          display: inline-block;
          transition: color .3s ease;
        }
        /* Mobile: sit above the filter bar (bottom ~24px + ~46px height + 10px gap = ~80px) */
        @media (hover: none), (pointer: coarse) {
          .footer-credit {
            bottom: 82px;
          }
          .footer-credit-link {
            font-size: 12px;
            color: rgba(255,255,255,0.50);
            padding: 6px 10px;
          }
        }
      `}</style>
    </>
  );
}
