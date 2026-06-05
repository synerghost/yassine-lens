import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

/**
 * Shared liquid-glass fixed header used by Experience and ProjectExperience.
 * Children are laid out as a space-between flex row.
 */
export default function GlassHeader({ children, style, logoLink }: { children: ReactNode; style?: CSSProperties; logoLink?: boolean }) {
  return (
    <header
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        right: 12,
        zIndex: 250,
        height: 54,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px 0 22px",
        background: "var(--glass-bg)",
        backdropFilter: "blur(22px) saturate(1.6)",
        WebkitBackdropFilter: "blur(22px) saturate(1.6)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
        ...style,
      }}
    >
      {children}
    </header>
  );
}

/** Reusable circular pill button (the "+" and "×" buttons in header). */
export function CircleButton({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 17,
        lineHeight: 1,
        background: "rgba(var(--fg-rgb), 0.08)",
        border: "1px solid rgba(var(--fg-rgb), 0.22)",
        boxShadow: "inset 0 1px 0 rgba(var(--fg-rgb), 0.18)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
