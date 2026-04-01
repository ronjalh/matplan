import { auth } from "@/lib/auth/auth-config";
import { Compass } from "lucide-react";
import { DashboardCard } from "@/components/dashboard-card";
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
        <DashboardCard
          href="/kalender"
          icon="calendar"
          title="Kalender"
          description="Planlegg ukens måltider og aktiviteter"
          color="#4A90A4"
        />
        <DashboardCard
          href="/oppskrifter"
          icon="chefhat"
          title="Oppskrifter"
          description="Dine oppskrifter og utforsk nye"
          color="#C27B5A"
        />
        <DashboardCard
          href="/handleliste"
          icon="shoppingcart"
          title="Handleliste"
          description="Generer handleliste fra ukeplanen"
          color="#E06090"
        />
        <DashboardCard
          href="/budsjett"
          icon="wallet"
          title="Budsjett"
          description="Hold styr på matbudsjettet og andre utgifter"
          color="#9B7ED8"
        />
        <DashboardCard
          href="/sesong"
          icon="sprout"
          title="I sesong"
          description="Se hva som er i sesong i Norge akkurat nå"
          color="#6ABF69"
        />
      </div>
    </div>
  );
}
