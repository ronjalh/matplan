"use client";

import { useState } from "react";
import { completeOnboarding, skipOnboarding, quickPlanOnboarding } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Leaf, ShoppingCart, Wallet, Wand2, Users } from "lucide-react";
import { PandaMascot } from "@/components/panda-mascot";

const steps = ["Velkommen", "Kosthold", "Priskilde", "Budsjett"];

export function OnboardingWizard({ userName }: { userName: string }) {
  const [step, setStep] = useState(0);
  const [quickMode, setQuickMode] = useState(false);
  const [quickDiet, setQuickDiet] = useState("all");
  const [quickServings, setQuickServings] = useState("4");
  const [diet, setDiet] = useState("all");
  const [priceProvider, setPriceProvider] = useState("kassalapp");
  const [budgetType, setBudgetType] = useState("skip");

  function next() { setStep((s) => Math.min(s + 1, 3)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="p-6 space-y-6">
        {/* Skip + Progress */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-1">
            {quickMode ? (
              // In quick mode: show 2 steps, both filled (this is the last step)
              <>
                <div className="h-1 flex-1 rounded-full bg-primary" />
                <div className="h-1 flex-1 rounded-full bg-primary" />
              </>
            ) : (
              steps.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
              ))
            )}
          </div>
          <form action={skipOnboarding} className="ml-4">
            <Button type="submit" variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Hopp over
            </Button>
          </form>
        </div>

        {/* Step 1: Welcome */}
        {step === 0 && !quickMode && (
          <div className="text-center space-y-4 py-4">
            <PandaMascot size={80} />
            <h2 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
              Velkommen, {userName.split(" ")[0]}!
            </h2>
            <p className="text-muted-foreground">
              Matplan hjelper deg med å planlegge måltider, lage handlelister og holde styr på budsjettet.
              La oss sette opp appen for deg — det tar under ett minutt.
            </p>
            <div className="flex flex-col gap-2 items-center">
              <Button onClick={next} className="gap-2">
                Kom i gang <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => setQuickMode(true)} className="gap-2">
                <Wand2 className="w-4 h-4" /> Bare lag en middagsplan for meg!
              </Button>
            </div>
          </div>
        )}

        {/* Quick plan mode */}
        {step === 0 && quickMode && (
          <div className="space-y-5 py-2">
            <div className="text-center space-y-2">
              <PandaMascot size={60} />
              <h2 className="text-xl font-[family-name:var(--font-fraunces)] font-semibold">
                Rask middagsplan
              </h2>
              <p className="text-sm text-muted-foreground">
                Svar på to spørsmål, så genererer vi en ukeplan for deg.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Hvor mange spiser?</span>
              </div>
              <div className="flex gap-2">
                {["1", "2", "3", "4", "5", "6"].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuickServings(n)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      quickServings === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Kosthold</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Alt" },
                  { value: "vegetarian", label: "Vegetar" },
                  { value: "vegan", label: "Vegan" },
                  { value: "pescetarian", label: "Pescetarianer" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQuickDiet(opt.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      quickDiet === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setQuickMode(false)}>
                <ChevronLeft className="w-4 h-4" /> Tilbake
              </Button>
              <form action={async (formData) => {
                formData.set("diet", quickDiet);
                formData.set("servings", quickServings);
                await quickPlanOnboarding(formData);
              }}>
                <Button type="submit" className="gap-2">
                  <Wand2 className="w-4 h-4" /> Generer ukesplan
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Step 2: Diet */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Hva spiser du?</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Filtrerer oppskriftsøk og tilpasser ernæringstracking.
            </p>
            <div className="space-y-2">
              {[
                { value: "all", label: "Alt", desc: "Ingen restriksjoner" },
                { value: "vegetarian", label: "Vegetarianer", desc: "Ikke kjøtt eller fisk" },
                { value: "vegan", label: "Veganer", desc: "Ingen animalske produkter" },
                { value: "pescetarian", label: "Pescetarianer", desc: "Fisk OK, ikke kjøtt" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    diet === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="diet"
                    value={opt.value}
                    checked={diet === opt.value}
                    onChange={() => setDiet(opt.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={back}><ChevronLeft className="w-4 h-4" /> Tilbake</Button>
              <Button onClick={next}>Neste <ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 3: Price provider */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Hvor handler du?</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Bestemmer hvor prisene i handlelisten hentes fra.
            </p>
            <div className="space-y-2">
              {[
                { value: "kassalapp", label: "Flere butikker (anbefalt)", desc: "Priser fra Rema, Kiwi, Coop, Meny, Oda og flere. Prissammenligning inkludert." },
                { value: "oda", label: "Oda", desc: "Kun priser fra Oda netthandel." },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    priceProvider === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="priceProvider"
                    value={opt.value}
                    checked={priceProvider === opt.value}
                    onChange={() => setPriceProvider(opt.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={back}><ChevronLeft className="w-4 h-4" /> Tilbake</Button>
              <Button onClick={next}>Neste <ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 4: Budget */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Vil du sette opp et budsjett?</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Start med SIFO referansebudsjett basert på husstandstype. Du kan redigere alt etterpå.
            </p>
            <div className="space-y-2">
              {[
                { value: "single", label: "Enslig", desc: "~kr 10 800/mnd" },
                { value: "couple", label: "Par", desc: "~kr 18 500/mnd" },
                { value: "family", label: "Familie med barn", desc: "~kr 28 000/mnd" },
                { value: "skip", label: "Hopp over", desc: "Setter opp budsjett senere" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    budgetType === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="budgetType"
                    value={opt.value}
                    checked={budgetType === opt.value}
                    onChange={() => setBudgetType(opt.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={back}><ChevronLeft className="w-4 h-4" /> Tilbake</Button>
              <form action={async (formData) => {
                formData.set("diet", diet);
                formData.set("priceProvider", priceProvider);
                formData.set("budgetType", budgetType);
                await completeOnboarding(formData);
              }}>
                <Button type="submit" className="gap-2">
                  Ferdig — start Matplan 🐼
                </Button>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
