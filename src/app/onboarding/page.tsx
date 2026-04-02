import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  // Already completed onboarding
  if (settings?.onboardingComplete) redirect("/");

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <OnboardingWizard userName={session.user.name ?? "der"} />
    </div>
  );
}
