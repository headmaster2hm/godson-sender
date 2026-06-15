"use client";

import { useEffect, useState } from "react";
import { applyTheme, getResolvedTheme, toggleTheme, type Theme } from "@/lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getResolvedTheme());
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle group relative flex h-9 w-[4.25rem] items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm transition-colors hover:border-[var(--accent)]/40"
    >
      <span
        className={`theme-toggle-thumb absolute flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-md transition-transform duration-300 ease-out ${
          mounted ? (isDark ? "translate-x-[2.125rem]" : "translate-x-0") : "translate-x-0"
        }`}
      >
        {mounted && isDark ? (
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.752 15.002A9.718 9.718 0 0112 21.75 9.718 9.718 0 013.648 8.25 7.5 7.5 0 1019.5 15a1.5 1.5 0 001.252-.998z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V3A.75.75 0 0112 2.25zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.061a.75.75 0 011.061 0zM21.75 12a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 01-1.06 0l-1.061-1.06a.75.75 0 111.06-1.062l1.061 1.061a.75.75 0 010 1.062zM12 18a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 18zM7.758 17.834a.75.75 0 01-1.06-1.061l1.06-1.061a.75.75 0 111.061 1.06l-1.061 1.062zM6 12a.75.75 0 01-.75.75H3.75a.75.75 0 010-1.5h1.5A.75.75 0 016 12zM6.697 7.757a.75.75 0 011.06 0l1.061 1.06a.75.75 0 11-1.06 1.061l-1.061-1.06a.75.75 0 010-1.062z" />
          </svg>
        )}
      </span>

      <span className="flex w-full justify-between px-2 text-[10px] text-[var(--text-muted)]">
        <span className={mounted && !isDark ? "opacity-0" : "opacity-60"}>☀</span>
        <span className={mounted && isDark ? "opacity-0" : "opacity-60"}>☾</span>
      </span>
    </button>
  );
}
