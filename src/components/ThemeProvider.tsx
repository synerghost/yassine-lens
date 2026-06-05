"use client";

import { createContext, useContext, useState } from "react";

type Theme = "dark" | "light";

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read from window.__THEME__ which is set synchronously by the inline script
  // in <head> — avoids a second render/flash vs reading localStorage in useEffect
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return ((window as Window & { __THEME__?: Theme }).__THEME__) ?? "dark";
    }
    return "dark";
  });

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.setAttribute("data-theme", next);
      (window as Window & { __THEME__?: Theme }).__THEME__ = next;
      return next;
    });
  };

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
