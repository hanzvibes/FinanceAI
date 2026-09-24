"use client";

import { Icon } from "@/shared/components/ui/icon";

export function ThemeToggle() {
  function toggleTheme() {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("financeai-theme", next);
  }

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={toggleTheme}
      aria-label="Ganti tema"
      title="Ganti tema"
    >
      <span className="theme-icon theme-icon-moon"><Icon name="moon" size={17} /></span>
      <span className="theme-icon theme-icon-sun"><Icon name="sun" size={17} /></span>
    </button>
  );
}
