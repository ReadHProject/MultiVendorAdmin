"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const isDark = theme === "dark";
  return (
    <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`p-2 rounded-md hover:bg-muted transition-colors ${className || ""}`}>
      <span className="material-symbols-outlined text-xl">{isDark ? "light_mode" : "dark_mode"}</span>
    </button>
  );
}
