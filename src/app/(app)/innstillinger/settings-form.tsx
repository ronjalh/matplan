"use client";

import { useState } from "react";
import { updateSettings, deleteAccount } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Leaf, Save, Loader2, Trash2, AlertTriangle } from "lucide-react";

interface Settings {
  priceProvider: string;
  dietaryPreference: string;
  theme: string;
}

export function SettingsForm({ settings }: { settings: Settings | null | undefined }) {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setPending(true);
    setSaved(false);
    await updateSettings(formData);
    setPending(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* Price provider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Priskilde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Velg hvor prisene i handlelisten hentes fra.
          </p>
          <div className="space-y-2">
            <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="priceProvider"
                value="kassalapp"
                defaultChecked={settings?.priceProvider !== "oda"}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-sm">Kassalapp (anbefalt)</p>
                <p className="text-xs text-muted-foreground">
                  Priser fra alle butikker — Rema, Kiwi, Coop, Meny, Oda og flere. Prissammenligning inkludert.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="priceProvider"
                value="oda"
                defaultChecked={settings?.priceProvider === "oda"}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-sm">Oda</p>
                <p className="text-xs text-muted-foreground">
                  Kun priser fra Oda netthandel.
                </p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Dietary preference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Kosthold
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Filtrerer oppskriftsøk og tilpasser ernæringstracking.
          </p>
          <select
            name="dietaryPreference"
            defaultValue={settings?.dietaryPreference ?? "all"}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">Ingen restriksjoner</option>
            <option value="vegetarian">Vegetarianer</option>
            <option value="vegan">Veganer</option>
            <option value="pescetarian">Pescetarianer</option>
          </select>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vedlikehold</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              const { retagFishRecipes } = await import("@/app/(app)/oppskrifter/actions");
              await retagFishRecipes();
              alert("Fiskemerking oppdatert for alle oppskrifter!");
            }}
          >
            Oppdater fiskemerking på oppskrifter
          </Button>
          <p className="text-xs text-muted-foreground">
            Skanner ingredienser og merker oppskrifter som inneholder fisk.
          </p>
        </CardContent>
      </Card>

      {/* Hidden theme field — keep current value */}
      <input type="hidden" name="theme" value={settings?.theme ?? "system"} />

      <Button type="submit" disabled={pending} className="w-full gap-2">
        {pending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Lagrer...</>
        ) : saved ? (
          "Lagret ✓"
        ) : (
          <><Save className="w-4 h-4" /> Lagre innstillinger</>
        )}
      </Button>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Faresone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Sletting av konto fjerner alle dine data permanent: oppskrifter, måltidsplaner,
            handlelister, budsjett og kalender. Dette kan ikke angres.
          </p>
          <Button
            type="button"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
            onClick={async () => {
              const confirmed = prompt(
                'Skriv "SLETT" for å bekrefte at du vil slette kontoen din permanent:'
              );
              if (confirmed !== "SLETT") return;
              await deleteAccount();
            }}
          >
            <Trash2 className="w-4 h-4" /> Slett min konto
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
