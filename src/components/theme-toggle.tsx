"use client";

import { Moon, Sun } from "lucide-react";
import * as React from "react";
import {
  applyTheme,
  getResolvedDark,
  getStoredTheme,
  setStoredTheme,
  type Theme,
} from "@/lib/theme";

export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setDark(getResolvedDark());
    applyTheme(getStoredTheme());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
        setDark(getResolvedDark());
      }
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const toggle = React.useCallback(() => {
    const stored = getStoredTheme();
    const resolved = getResolvedDark();
    const next: Theme = resolved ? "light" : "dark";
    setStoredTheme(next);
    applyTheme(next);
    setDark(!resolved);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-9 w-9 rounded-full bg-muted border border-border shrink-0"
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="h-9 min-w-[2.25rem] px-2.5 rounded-lg flex items-center justify-center bg-accent dark:bg-white/10 text-muted-foreground dark:text-white/90 hover:text-accent-foreground dark:hover:text-white border border-border dark:border-white/10 transition-colors shrink-0 cursor-pointer"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
