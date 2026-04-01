"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const icon =
    theme === "light" ? <Sun className="w-4 h-4" /> :
    theme === "dark" ? <Moon className="w-4 h-4" /> :
    <Monitor className="w-4 h-4" />;

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
