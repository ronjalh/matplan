import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Sprout, Wheat, Heart, Lightbulb } from "lucide-react";
import Link from "next/link";
import { getAvailableProduce } from "@/data/seasonal-produce";

const monthNames = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

export default async function InspirasjonPage() {
  const session = await auth();
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session!.user!.id!),
  });
  const diet = settings?.dietaryPreference ?? "all";
  const showFish = diet !== "vegetarian" && diet !== "vegan";

  const currentMonth = new Date().getMonth() + 1;
  const available = getAvailableProduce(currentMonth);
  const inSeasonVeg = available.filter((p) => p.status === "in-season" && (p.category === "groennsaker" || p.category === "frukt" || p.category === "baer"));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-1">
          Inspirasjon
        </h1>
        <p className="text-muted-foreground">
          Tips for å spise sunnere, billigere og mer variert.
        </p>
      </div>

      {/* 8 om dagen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[var(--color-success)]" />
            8 om dagen — frukt, grønt og fullkorn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Helsedirektoratet anbefaler 8 porsjoner om dagen: 5 frukt/grønt + 3 fullkorn.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-[var(--color-success)]/5 p-3 space-y-2">
              <p className="text-sm font-medium">5 porsjoner frukt og grønt</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>🥕 1 porsjon = ca. 100g (en håndfull)</li>
                <li>🍎 1 medium frukt = 1 porsjon</li>
                <li>🫐 1 dl bær = 1 porsjon</li>
                <li>🥗 Stor salat til lunsj = 2-3 porsjoner</li>
                <li>⚠️ Poteter teller IKKE som grønnsak</li>
                <li>⚠️ Juice teller maks 1, uansett mengde</li>
              </ul>
            </div>
            <div className="rounded-lg bg-[var(--color-warning)]/5 p-3 space-y-2">
              <p className="text-sm font-medium">3 porsjoner fullkorn</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>🍞 1 skive grovbrød = 1 porsjon</li>
                <li>🥣 1 dl havregryn = 1 porsjon</li>
                <li>🍚 0,75 dl fullkornsris (kokt) = 1 porsjon</li>
                <li>⚠️ Hvitt brød og vanlig ris teller IKKE</li>
                <li>✅ Se etter "grovt" eller "fullkorn" på pakken</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[var(--color-warning)]" />
              Enkle tips for å nå 8 om dagen
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li><span className="font-medium">Frokost:</span> Havregrøt med bær (2-3 porsjoner med én gang)</li>
              <li><span className="font-medium">Lunsj:</span> Grovbrød med grønnsaker på (2 porsjoner)</li>
              <li><span className="font-medium">Mellommåltid:</span> En frukt eller grønnsaker med dipp</li>
              <li><span className="font-medium">Middag:</span> Fyll halve tallerkenen med grønnsaker</li>
              <li><span className="font-medium">Smoothie:</span> Bland frukt og spinat — enkel vei til 2-3 porsjoner</li>
            </ul>
          </div>

          <Link href="/oppskrifter?tab=utforsk" className="text-sm text-primary hover:underline">
            Søk etter oppskrifter med mye grønnsaker →
          </Link>
        </CardContent>
      </Card>

      {/* Fish */}
      {showFish && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Fish className="w-5 h-5 text-[var(--color-fish)]" />
              Fisk 2-3 ganger i uken
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Helsedirektoratet anbefaler 2-3 fiskemiddager per uke, hvorav minst én med fet fisk.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[var(--color-fish)]/5 p-3 space-y-2">
                <p className="text-sm font-medium">Fet fisk (minst 1 gang/uke)</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>🐟 Laks — mest populær, allsidig</li>
                  <li>🐟 Makrell — billig, bra på grillen</li>
                  <li>🐟 Ørret — mildere enn laks</li>
                  <li>🐟 Sild — tradisjonelt, næringsrik</li>
                  <li>🐟 Sardiner — på boks, enkel lunsj</li>
                </ul>
                <p className="text-[10px] text-muted-foreground">Rik på omega-3 fettsyrer, vitamin D og protein.</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                <p className="text-sm font-medium">Mager fisk</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>🐟 Torsk — klassiker, mild smak</li>
                  <li>🐟 Sei — rimelig, fast kjøtt</li>
                  <li>🐟 Hyse — godt for fish & chips</li>
                  <li>🐟 Kveite — eksklusiv, fast</li>
                  <li>🐟 Steinbit — saftig, mye smak</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[var(--color-warning)]" />
                Tips for mer fisk i hverdagen
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li><span className="font-medium">Planlegg:</span> Sett inn fisk på 2-3 faste dager i ukeplanen</li>
                <li><span className="font-medium">Frossenfisk:</span> Alltid ha torskefilet eller laksefilet i fryseren</li>
                <li><span className="font-medium">Boks:</span> Makrell i tomat eller sardiner er rask lunsj</li>
                <li><span className="font-medium">Reker:</span> Pillede reker i salat, wok eller pasta</li>
                <li><span className="font-medium">Fiskekaker:</span> Barnevennlig alternativ, lag selv eller kjøp</li>
              </ul>
            </div>

            <Link href="/oppskrifter?tab=utforsk" className="text-sm text-primary hover:underline">
              Søk etter fiskeoppskrifter →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Tallerkensmodellen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#E06090]" />
            Tallerkensmodellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Del tallerkenen i tre like store deler for et balansert måltid.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-[var(--color-success)]/10 p-3">
              <p className="text-2xl mb-1">🥬</p>
              <p className="text-xs font-medium">⅓ Grønnsaker</p>
              <p className="text-[10px] text-muted-foreground">Salat, brokkoli, gulrot, paprika</p>
            </div>
            <div className="rounded-lg bg-[var(--color-warning)]/10 p-3">
              <p className="text-2xl mb-1">🍚</p>
              <p className="text-xs font-medium">⅓ Karbohydrater</p>
              <p className="text-[10px] text-muted-foreground">Potet, ris, pasta, brød</p>
            </div>
            <div className="rounded-lg bg-[var(--color-terracotta)]/10 p-3">
              <p className="text-2xl mb-1">🍗</p>
              <p className="text-xs font-medium">⅓ Protein</p>
              <p className="text-[10px] text-muted-foreground">Fisk, kjøtt, egg, bønner</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal tips */}
      {inSeasonVeg.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[var(--color-success)]" />
              I sesong nå · {monthNames[currentMonth - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Sesongvarer er ferskere, billigere og mer bærekraftige.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {inSeasonVeg.map((p) => (
                <span key={p.name} className="text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full px-2.5 py-1">
                  {p.name}
                </span>
              ))}
            </div>
            <Link href="/sesong" className="text-sm text-primary hover:underline block mt-2">
              Se full sesongoversikt →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Budget tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[var(--color-warning)]" />
            Spar penger på mat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li><span className="font-medium text-foreground">Planlegg uken:</span> Unngå impulshandling — bruk ukeplanen og handlelisten</li>
            <li><span className="font-medium text-foreground">Sesongvarer:</span> Billigere og ferskere — sjekk sesongsiden</li>
            <li><span className="font-medium text-foreground">Basisvarer:</span> Ris, pasta, bønner, linser og havregryn er billige og næringsrike</li>
            <li><span className="font-medium text-foreground">Frossent:</span> Frosne grønnsaker er like næringsrike som ferske, men billigere</li>
            <li><span className="font-medium text-foreground">Batch cooking:</span> Lag dobbel porsjon og frys inn — spar tid og penger</li>
            <li><span className="font-medium text-foreground">Sammenlign priser:</span> Bruk Kassalapp i handlelisten for å finne billigste butikk</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
