"use client";

import { signIn } from "next-auth/react";
import { PandaMascot } from "@/components/panda-mascot";
import { CalendarDays, ShoppingCart, ChefHat, PiggyBank, Leaf, Fish } from "lucide-react";

const features = [
  { icon: CalendarDays, label: "Ukesplanlegger", color: "text-primary" },
  { icon: ChefHat, label: "Oppskrifter", color: "text-[var(--color-terracotta)]" },
  { icon: ShoppingCart, label: "Handleliste", color: "text-[var(--color-fish)]" },
  { icon: PiggyBank, label: "Budsjett", color: "text-[var(--color-warning)]" },
  { icon: Leaf, label: "Sesongvarer", color: "text-[var(--color-success)]" },
  { icon: Fish, label: "Ernæring", color: "text-[var(--color-fish)]" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Hero section */}
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Panda + title */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <PandaMascot size={100} />
          </div>
          <h1 className="text-4xl font-[family-name:var(--font-fraunces)] font-semibold">
            Matplan
          </h1>
          <p className="text-muted-foreground text-lg">
            Planlegg måltider, spar penger, spis bedre.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {features.map(({ icon: Icon, label, color }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-medium"
            >
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              {label}
            </span>
          ))}
        </div>

        {/* Login card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <p className="text-sm text-muted-foreground">
            Gratis for alle. Logg inn for å komme i gang.
          </p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Logg inn med Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/60">
          Norsk matplanlegger med oppskrifter, priser og ernæring
        </p>
      </div>
    </div>
  );
}
