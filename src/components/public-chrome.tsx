"use client";

import { signIn } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogIn } from "lucide-react";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex-1" />
        <ThemeToggle />
        <button
          onClick={() => signIn("google")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          Logg inn
        </button>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
