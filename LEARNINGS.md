# LEARNINGS.md

## 2026-04-01 — Fase 1 & 2 Oppstart

### Tekniske funn

- **Neon connection string:** `channel_binding=require` forårsaker problemer. Fjern det — `sslmode=require` er nok.

- **NextAuth DrizzleAdapter:** Krever eksplisitte tabellreferanser: `{ usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }`. Uten dette feiler auth med `42P01` (relation does not exist).

- **NextAuth signIn redirect:** Server Action `signIn()` fra `@/lib/auth/auth-config` redirecter ikke riktig i nettleseren. Bruk klient-side `signIn()` fra `next-auth/react` i stedet.

- **shadcn/ui + React 19:** `asChild` prop gir TypeScript-feil og runtime warnings. Bruk vanlige `<Link>`-elementer i stedet.

- **Drizzle-kit:** Leser ikke `.env.local` automatisk. Må ha `import "dotenv/config"` i `drizzle.config.ts` og en kopi som `.env`.

- **Server Actions: ALDRI throw i produksjon.** `throw new Error()` gir generisk "Server Components render error" — feilmeldingen stripes bort. Bruk alltid `return { success: false, error: "melding" }` og sjekk resultatet i klienten.

- **Kan ikke sende React-komponenter (ikoner) fra Server til Client Components.** Lucide-ikoner er objekter med metoder og kan ikke serialiseres over server/client-grensen. Løsning: bruk streng-basert icon-mapping i client component (`iconMap = { calendar: Calendar, ... }`) og send streng-nøkkel som prop.

- **CSS spacing med Link-wrapper:** `space-y-3` og `gap-3` fungerer ikke når `<Link>` er inline. Må sette `className="block"` på Link for at flex/grid gap skal fungere mellom kort.

- **Spoonacular auth:** Profil-siden viser "hash" og "pin", men API-nøkkelen er en separat verdi som finnes et annet sted i konsollen. Hash er IKKE API-nøkkelen.

### UX-lærdommer

- **Dark mode toggle:** Ikke plasser i sidebar footer — brukere finner den ikke. Plasser ved siden av profil-avatar i headeren.

- **Dobbelt-submit på skjemaer:** Brukere dobbeltklikker. ALLTID implementer: (1) `disabled={pending}` på submit-knappen, (2) `if (pending) return` guard i handler, (3) reset skjema etter vellykket submit.

- **CRUD er ikke komplett uten Read og Update:** Å bygge Create uten View/Edit er halvferdig. Brukere forventer å kunne klikke på det de nettopp lagde. Bygg alltid full CRUD samtidig.

- **Oppskrifter trenger ingredienser fra dag 1:** En oppskrift uten ingrediens-felt er ikke en oppskrift. Aldri ship oppskrift-CRUD uten ingredienser.

- **Duplikat-innhold irriterer:** Brukere oppretter lett duplikater (dobbeltklikk, gjentatte submissions). Implementer duplikatsjekk server-side (sjekk navn i household).

- **Kjøkken bør være dropdown, ikke fritekst.** Gir konsistente verdier for filtrering. Fritekst → "norsk", "Norsk", "NORSK" — umulig å filtrere.

- **Hover-effekter signaliserer klikkbarhet.** Kort uten hover-effekt ser ut som statisk innhold. Bruk: border-farge endring, shadow, scale, tittel-farge — og unik farge per kort gir identitet.

- **Søk/Utforsk bør være like prominent som egne data.** Ikke gjem søk bak en liten knapp. Bruk faner (Mine oppskrifter / Utforsk / Ny) — standard mønster fra Mealime, Paprika etc.

### Prosess-lærdommer

- **Bygg minimalt men komplett:** Ikke ship halvferdige features. Bedre å ha færre features som er fullstendige.

- **Test i nettleser tidlig:** Bygg-feil fanges av `next build`, men UX-problemer oppdages bare ved å faktisk bruke appen.

- **Produksjon avslører feil som dev skjuler.** Server Action throws, serialiseringsfeil, og env-variabler som mangler — test alltid på Vercel-deploy, ikke bare localhost.
