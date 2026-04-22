"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="rounded border border-[var(--border-default)] px-3 py-1.5 text-sm hover:bg-[var(--bg-surface)]"
      aria-label="Toggle dark mode"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
