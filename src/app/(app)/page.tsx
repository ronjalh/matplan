import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { mealPlan, recipes, householdMembers, budgetCategories, budgetEntries } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { Compass, Fish, Utensils, Sprout } from "lucide-react";
import { DashboardCard } from "@/components/dashboard-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getWeekDays, toISODate, getISOWeekNumber } from "@/lib/date-utils";
import { getAvailableProduce } from "@/data/seasonal-produce";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "der";

  const membership = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, session!.user!.id!),
  });
  const householdId = membership?.householdId;

  const days = getWeekDays(new Date());
  const startDate = toISODate(days[0]);
  const endDate = toISODate(days[6]);
  const weekNum = getISOWeekNumber(new Date());

  let dinnerCount = 0;
  let fishCount = 0;
  let budgetCats: { name: string; monthlyLimitOre: number; color: string | null; spent: number }[] = [];
  let totalBudgetOre = 0;
  let totalSpentOre = 0;

  if (householdId) {
    const meals = await db
      .select({ mealType: mealPlan.mealType, isFish: recipes.isFishMeal })
      .from(mealPlan)
      .leftJoin(recipes, eq(mealPlan.recipeId, recipes.id))
      .where(and(eq(mealPlan.householdId, householdId), gte(mealPlan.date, startDate), lte(mealPlan.date, endDate)));

    dinnerCount = meals.filter((m) => m.mealType === "middag").length;
    fishCount = meals.filter((m) => m.isFish).length;

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${lastDay}`;

    const cats = await db.query.budgetCategories.findMany({
      where: eq(budgetCategories.householdId, householdId),
      orderBy: [budgetCategories.sortOrder],
    });

    const allEntries = await db.query.budgetEntries.findMany({
      where: and(eq(budgetEntries.householdId, householdId), gte(budgetEntries.date, monthStart), lte(budgetEntries.date, monthEnd)),
    });

    budgetCats = cats.map((c) => ({
      name: c.name,
      monthlyLimitOre: c.monthlyLimitOre,
      color: c.color,
      spent: allEntries.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amountOre, 0),
    }));

    totalBudgetOre = cats.reduce((s, c) => s + c.monthlyLimitOre, 0);
    totalSpentOre = allEntries.reduce((s, e) => s + e.amountOre, 0);
  }

  const currentMonth = new Date().getMonth() + 1;
  const available = getAvailableProduce(currentMonth);
  const inSeason = available.filter((p) => p.status === "in-season");
  const fromStorage = available.filter((p) => p.status === "from-storage");
  const monthNames = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

  function formatKr(ore: number) {
    return `kr ${Math.round(ore / 100).toLocaleString("nb-NO")}`;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
          Velkommen, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">Hva vil du gjøre i dag?</p>
      </div>

      {/* Explore button */}
      <Link href="/oppskrifter?tab=utforsk" className="block group">
        <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/15 p-3 transition-colors group-hover:bg-primary/25">
              <Compass className="w-7 h-7 text-primary transition-transform group-hover:rotate-45" />
            </div>
            <div>
              <p className="text-lg font-semibold group-hover:text-primary transition-colors">Utforsk oppskrifter</p>
              <p className="text-sm text-muted-foreground">Søk blant 685 000+ internasjonale oppskrifter</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Navigation cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard href="/kalender" icon="calendar" title="Kalender" description="Planlegg ukens måltider og aktiviteter" color="#4A90A4" />
        <DashboardCard href="/oppskrifter" icon="chefhat" title="Oppskrifter" description="Dine oppskrifter og utforsk nye" color="#C27B5A" />
        <DashboardCard href="/handleliste" icon="shoppingcart" title="Handleliste" description="Generer handleliste fra ukeplanen" color="#E06090" />
        <DashboardCard href="/budsjett" icon="wallet" title="Budsjett" description="Hold styr på matbudsjettet og andre utgifter" color="#9B7ED8" />
        <DashboardCard href="/sesong" icon="sprout" title="I sesong" description="Se hva som er i sesong i Norge akkurat nå" color="#6ABF69" />
      </div>

      {/* ─── Weekly overview section ─── */}
      <div className="border-t border-border pt-6 space-y-4">
        <h2 className="text-lg font-[family-name:var(--font-fraunces)] font-semibold text-muted-foreground">
          Denne uken — Uke {weekNum}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Dinners + Fish */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#C27B5A]" />
                Middager og fisk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Middager planlagt</span>
                  <span className="font-medium">{dinnerCount}/7</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full ${
                        i < dinnerCount ? "bg-[#C27B5A]" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Fiskmåltider</span>
                  <span className={`font-medium ${fishCount >= 2 ? "text-[var(--color-fish)]" : ""}`}>
                    {fishCount}/2–3 {fishCount >= 2 && "✓"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Fish
                      key={i}
                      className={`w-5 h-5 ${
                        i < fishCount ? "text-[var(--color-fish)]" : "text-muted/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seasonal */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[var(--color-success)]" />
                I sesong — {monthNames[currentMonth - 1]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inSeason.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Lite høstes i Norge akkurat nå. <Link href="/sesong" className="text-primary hover:underline">Se hva som kommer snart →</Link>
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {inSeason.slice(0, 8).map((p) => (
                    <span key={p.name} className="text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full px-2 py-0.5">
                      {p.name}
                    </span>
                  ))}
                  {inSeason.length > 8 && (
                    <Link href="/sesong" className="text-xs text-muted-foreground hover:text-primary">
                      +{inSeason.length - 8} til
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Budget overview */}
        {budgetCats.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#9B7ED8]" />
                  Budsjett denne måneden
                </CardTitle>
                <span className="text-sm font-medium">
                  {formatKr(totalSpentOre)} / {formatKr(totalBudgetOre)}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((totalSpentOre / totalBudgetOre) * 100, 100)}%`,
                    backgroundColor:
                      totalSpentOre / totalBudgetOre > 1 ? "var(--color-error)" :
                      totalSpentOre / totalBudgetOre > 0.85 ? "var(--color-warning)" :
                      "var(--color-success)",
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {budgetCats.map((cat) => {
                  const ratio = cat.monthlyLimitOre > 0 ? cat.spent / cat.monthlyLimitOre : 0;
                  const isSavings = cat.name.toLowerCase().includes("sparing");
                  return (
                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color ?? "#7C9A7E" }} />
                      <span className="flex-1 min-w-0 truncate text-muted-foreground">{cat.name}</span>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(ratio * 100, 100)}%`,
                            backgroundColor: isSavings
                              ? cat.color ?? "#4ABFA8"
                              : ratio > 1 ? "var(--color-error)"
                              : ratio > 0.85 ? "var(--color-warning)"
                              : cat.color ?? "var(--color-success)",
                          }}
                        />
                      </div>
                      <span className="w-14 text-right text-muted-foreground">{formatKr(cat.spent)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
