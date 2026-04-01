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
        <Link href="/kalender">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Kalender</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Planlegg ukens måltider og aktiviteter
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/oppskrifter">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <ChefHat className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Oppskrifter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dine oppskrifter og utforsk nye
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/handleliste">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Handleliste</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generer handleliste fra ukeplanen
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/budsjett">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Wallet className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Budsjett</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hold styr på matbudsjettet og andre utgifter
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sesong">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Sprout className="w-5 h-5 text-[var(--color-success)]" />
              <CardTitle className="text-base">I sesong</CardTitle>
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
