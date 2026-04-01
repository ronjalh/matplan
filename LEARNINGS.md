# LEARNINGS.md

## 2026-04-01 — Fase 1 & 2 Oppstart

### Tekniske funn

- **Neon connection string:** `channel_binding=require` forårsaker problemer. Fjern det — `sslmode=require` er nok.

- **NextAuth DrizzleAdapter:** Krever eksplisitte tabellreferanser: `{ usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }`. Uten dette feiler auth med `42P01` (relation does not exist).

- **NextAuth signIn redirect:** Server Action `signIn()` fra `@/lib/auth/auth-config` redirecter ikke riktig i nettleseren. Bruk klient-side `signIn()` fra `next-auth/react` i stedet.

- **shadcn/ui + React 19:** `asChild` prop gir warning. Bruk vanlige `<Link>`-elementer i stedet for `asChild` på shadcn-komponenter for å unngå TypeScript-feil og warnings.

- **Drizzle-kit:** Leser ikke `.env.local` automatisk. Må ha `import "dotenv/config"` i `drizzle.config.ts` og en kopi som `.env`.

### UX-lærdommer

- **Dark mode toggle:** Ikke plasser i sidebar footer — brukere finner den ikke. Plasser ved siden av profil-avatar i headeren.

- **Dobbelt-submit på skjemaer:** Brukere dobbeltklikker. ALLTID implementer: (1) `disabled={pending}` på submit-knappen, (2) `if (pending) return` guard i handler, (3) reset skjema etter vellykket submit.

- **CRUD er ikke komplett uten Read og Update:** Å bygge Create uten View/Edit er halvferdig. Brukere forventer å kunne klikke på det de nettopp lagde. Bygg alltid full CRUD (Create, Read, Update, Delete) samtidig.

- **Oppskrifter trenger ingredienser fra dag 1:** En oppskrift uten ingrediens-felt er ikke en oppskrift. Ingredienser er kjernedata som alt annet bygger på (tallerkensmodell, handleliste, prisberegning). Aldri ship oppskrift-CRUD uten ingredienser.

### Prosess-lærdommer

- **Bygg minimalt men komplett:** Ikke ship halvferdige features. En oppskrift som kan opprettes men ikke sees eller redigeres gir dårlig brukeropplevelse. Bedre å ha færre features som er fullstendige.

- **Test i nettleser tidlig:** Bygg-feil (TypeScript) fanges av `next build`, men UX-problemer (usynlig knapp, manglende felt) oppdages bare ved å faktisk bruke appen.
