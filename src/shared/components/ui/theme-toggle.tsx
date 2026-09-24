"use client";

import { Icon } from "@/shared/components/ui/icon";
import { hapticTick } from "@/shared/utils/haptics";

function syncThemeColor(theme: "light" | "dark") {
  const color = theme === "dark" ? "#0d1210" : "#ffffff";
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = color;
  });
}

export function ThemeToggle() {
  function toggleTheme() {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("financeai-theme", next);
    syncThemeColor(next);
    hapticTick();
  }

  return (
    <button type="button" className="icon-button theme-toggle" onClick={toggleTheme} aria-label="Ganti tema" title="Ganti tema">
      <span className="theme-icon theme-icon-moon"><Icon name="moon" size={17} /></span>
      <span className="theme-icon theme-icon-sun"><Icon name="sun" size={17} /></span>
    </button>
  );
}
