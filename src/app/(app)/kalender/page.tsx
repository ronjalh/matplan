import { getWeekData } from "./actions";
import { WeekView } from "./week-view";
import { getWeekDays, toISODate } from "@/lib/date-utils";
import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; autoplan?: string }>;
}) {
  const params = await searchParams;
  const baseDate = params.week ? new Date(params.week) : new Date();
  const days = getWeekDays(baseDate);
  const startDate = toISODate(days[0]);
  const endDate = toISODate(days[6]);

  const { meals, events, allRecipes } = await getWeekData(startDate, endDate);

  const session = await auth();
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session!.user!.id!),
  });
  const showFish = settings?.dietaryPreference !== "vegetarian" && settings?.dietaryPreference !== "vegan";

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
        Kalender
      </h1>
      <WeekView
        days={days.map((d) => d.toISOString())}
        meals={meals}
        events={events}
        allRecipes={allRecipes}
        showFish={showFish}
        diet={settings?.dietaryPreference ?? "all"}
        autoOpenPlan={params.autoplan === "true"}
      />
    </div>
  );
}
