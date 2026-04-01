"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";
  const icon = isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;

  return (
    <button
      onClick={() => setTheme(next)}
      className="p-2 rounded-md hover:bg-muted transition-colors cursor-pointer"
      aria-label={`Bytt tema til ${next}`}
    >
      {icon}
    </button>
  );
}
