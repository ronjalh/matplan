import { auth } from "@/lib/auth/auth-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChefHat, ShoppingCart, Wallet, Sprout, Compass } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "der";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
          Velkommen, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Hva vil du gjøre i dag?
        </p>
      </div>

      {/* Explore recipes */}
      <Link href="/oppskrifter?tab=utforsk" className="block group">
        <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/15 p-3 transition-colors group-hover:bg-primary/25">
              <Compass className="w-7 h-7 text-primary transition-transform group-hover:rotate-45" />
            </div>
            <div>
              <p className="text-lg font-semibold group-hover:text-primary transition-colors">
                Utforsk oppskrifter
              </p>
              <p className="text-sm text-muted-foreground">
                Søk blant 685 000+ internasjonale oppskrifter — vegetar, indisk, italiensk og mer
              </p>
            </div>
          </div>
        </div>
      </Link>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/kalender" className="block group">
          <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-base group-hover:text-primary transition-colors">Kalender</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Planlegg ukens måltider og aktiviteter
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/oppskrifter" className="block group">
          <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-base group-hover:text-primary transition-colors">Oppskrifter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dine oppskrifter og utforsk nye
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/handleliste" className="block group">
          <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-base group-hover:text-primary transition-colors">Handleliste</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generer handleliste fra ukeplanen
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/budsjett" className="block group">
          <Card className="h-full transition-all group-hover:border-[var(--color-warning)]/50 group-hover:shadow-lg group-hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="rounded-full bg-[var(--color-warning)]/10 p-2 transition-colors group-hover:bg-[var(--color-warning)]/20">
                <Wallet className="w-5 h-5 text-[var(--color-warning)]" />
              </div>
              <CardTitle className="text-base group-hover:text-[var(--color-warning)] transition-colors">Budsjett</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hold styr på matbudsjettet og andre utgifter
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sesong" className="block group">
          <Card className="h-full transition-all group-hover:border-[var(--color-success)]/50 group-hover:shadow-lg group-hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="rounded-full bg-[var(--color-success)]/10 p-2 transition-colors group-hover:bg-[var(--color-success)]/20">
                <Sprout className="w-5 h-5 text-[var(--color-success)]" />
              </div>
              <CardTitle className="text-base group-hover:text-[var(--color-success)] transition-colors">I sesong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Se hva som er i sesong i Norge akkurat nå
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
