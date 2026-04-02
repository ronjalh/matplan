import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { mealPlan, recipes, calendarEvents, householdMembers, budgetCategories, budgetEntries } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { Compass } from "lucide-react";
import { DashboardCard } from "@/components/dashboard-card";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { getWeekDays, toISODate, getISOWeekNumber } from "@/lib/date-utils";
import { getAvailableProduce } from "@/data/seasonal-produce";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "der";

  // Get household
  const membership = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, session!.user!.id!),
  });
  const householdId = membership?.householdId;

  // Week data
  const days = getWeekDays(new Date());
  const startDate = toISODate(days[0]);
  const endDate = toISODate(days[6]);
  const weekNum = getISOWeekNumber(new Date());

  let dinnerCount = 0;
  let fishCount = 0;
  let totalBudgetOre = 0;
  let totalSpentOre = 0;

  if (householdId) {
    // Meals this week
    const meals = await db
      .select({ mealType: mealPlan.mealType, isFish: recipes.isFishMeal })
      .from(mealPlan)
      .leftJoin(recipes, eq(mealPlan.recipeId, recipes.id))
      .where(and(eq(mealPlan.householdId, householdId), gte(mealPlan.date, startDate), lte(mealPlan.date, endDate)));

    dinnerCount = meals.filter((m) => m.mealType === "middag").length;
    fishCount = meals.filter((m) => m.isFish).length;

    // Budget this month
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${lastDay}`;

    const cats = await db.query.budgetCategories.findMany({
      where: eq(budgetCategories.householdId, householdId),
    });
    totalBudgetOre = cats.reduce((s, c) => s + c.monthlyLimitOre, 0);

    const entries = await db.query.budgetEntries.findMany({
      where: and(eq(budgetEntries.householdId, householdId), gte(budgetEntries.date, monthStart), lte(budgetEntries.date, monthEnd)),
    });
    totalSpentOre = entries.reduce((s, e) => s + e.amountOre, 0);
  }

  // Seasonal
  const currentMonth = new Date().getMonth() + 1;
  const inSeason = getAvailableProduce(currentMonth).filter((p) => p.status === "in-season");

  function formatKr(ore: number) {
    return `kr ${Math.round(ore / 100).toLocaleString("nb-NO")}`;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
          Velkommen, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Uke {weekNum} — {dinnerCount}/7 middager planlagt
          {fishCount > 0 && ` · ${fishCount} fiskmåltid${fishCount > 1 ? "er" : ""}`}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {totalBudgetOre > 0 && (
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Budsjett denne mnd.</p>
              <p className="font-semibold">{formatKr(totalSpentOre)} / {formatKr(totalBudgetOre)}</p>
              <div className="w-full h-1.5 bg-muted rounded-full mt-1">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((totalSpentOre / totalBudgetOre) * 100, 100)}%`,
                    backgroundColor: totalSpentOre / totalBudgetOre > 0.85 ? "var(--color-warning)" : "var(--color-success)",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Fisk denne uken</p>
            <p className={`font-semibold ${fishCount >= 2 ? "text-[var(--color-fish)]" : ""}`}>
              {fishCount}/2–3 {fishCount >= 2 && "✓"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">I sesong nå</p>
            <p className="font-semibold text-[var(--color-success)]">
              {inSeason.length} råvarer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Explore */}
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
        <DashboardCard href="/kalender" icon="calendar" title="Kalender" description="Planlegg ukens måltider og aktiviteter" color="#4A90A4" />
        <DashboardCard href="/oppskrifter" icon="chefhat" title="Oppskrifter" description="Dine oppskrifter og utforsk nye" color="#C27B5A" />
        <DashboardCard href="/handleliste" icon="shoppingcart" title="Handleliste" description="Generer handleliste fra ukeplanen" color="#E06090" />
        <DashboardCard href="/budsjett" icon="wallet" title="Budsjett" description="Hold styr på matbudsjettet og andre utgifter" color="#9B7ED8" />
        <DashboardCard href="/sesong" icon="sprout" title="I sesong" description="Se hva som er i sesong i Norge akkurat nå" color="#6ABF69" />
      </div>
    </div>
  );
}
