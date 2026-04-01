import { getUserSettings } from "./actions";
import { SettingsForm } from "./settings-form";
import { auth } from "@/lib/auth/auth-config";

export default async function InnstillingerPage() {
  const session = await auth();
  const settings = await getUserSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-1">
          Innstillinger
        </h1>
        <p className="text-muted-foreground">
          Tilpass appen — priskilde, kosthold og tema.
        </p>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-4 rounded-lg border border-border p-4">
        {session?.user?.image && (
          <img src={session.user.image} alt="" className="w-12 h-12 rounded-full" />
        )}
        <div>
          <p className="font-medium">{session?.user?.name}</p>
          <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
        </div>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
