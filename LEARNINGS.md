# LEARNINGS.md

## 2026-04-01 — Fase 1 & 2 Oppstart

### Tekniske funn
- **Neon:** `channel_binding=require` feiler. Bruk kun `sslmode=require`.
- **NextAuth DrizzleAdapter:** Trenger eksplisitte tabellreferanser.
- **NextAuth signIn:** Bruk klient-side `signIn()` fra `next-auth/react`, ikke server action.
- **shadcn/ui + React 19:** `asChild` gir TypeScript-feil. Bruk `<Link>` direkte.
- **Drizzle-kit:** Trenger `import "dotenv/config"` + `.env` kopi.
- **Server Actions:** ALDRI throw. Returner `{ success, error }`.
- **Server→Client grense:** Kan ikke sende React-komponenter. Bruk streng-mapping.
- **Link spacing:** `<Link>` trenger `className="block"` for flex gap.
- **Spoonacular:** "hash" ≠ API key. Separate verdier.

### UX-lærdommer
- Dark mode toggle i header, ikke sidebar. Kun sol/måne.
- ALLTID double-submit protection.
- Bygg full CRUD samtidig.
- Ingredienser fra dag 1.
- Dropdown > fritekst for kategorier.
- Hover-effekter med unik farge per kort.
- Faner for lik prominens (Mine/Utforsk/Ny).

## 2026-04-02 — Fase 3-6

### Tekniske funn
- **toISODate() UTC-bug:** `.toISOString()` → UTC → feil dato. Bruk `getFullYear()/getMonth()/getDate()`. Funnet av Vitest.
- **Regex "løk"→"øk":** `\bl\b` i STRIP_PATTERN matcher "l" i "løk". Fjern single-char enheter.
- **"ground beef"→"beef":** "ground" i STRIP_PATTERN for aggressiv. Fjern, legg til "beef" refinement.
- **Kassalapp → barnemat:** Vage søk returnerer babypuré/iskrem. Løsning: spesifikke produktnavn i refinements + filtrer ut barnemat-kategorier + ekskluder "6mnd"/"8mnd" i produktnavn.
- **Kassalapp URL-encoding:** Norske tegn MÅ URL-encodes. `encodeURIComponent()` fungerer.
- **Drizzle-kit non-interactive:** Kan ikke rename kolonner. Legg til nye i stedet.
- **Fish detection:** Spoonacular-import satte `isFishMeal: false` hardkodet. Fikset med regex på ingrediensnavn.

### UX-lærdommer
- Fargekoder trenger ALLTID legende/forklaring.
- "Kopiert!"-knapper bør resette etter 2s og ved kontekstbytte.
- Avhukede varer → egen "Fullført"-seksjon, ikke blandet.
- Repeating events: enklere å opprette N separate events.
- Kalender-handleliste kobling via linkedResourceType/Id er elegant.
- Handlelistenavn bør være konsistente ("Uke 14", ikke mix av formater).

### Prosess
- Tester finner reelle bugs (toISODate, regex). Verdt å skrive.
- Kassalapp-refinements er pågående — 150+ er bra men trenger bruker-lært matching.
- Test alltid på Vercel-deploy, ikke bare localhost.
