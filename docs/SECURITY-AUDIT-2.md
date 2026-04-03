# Sikkerhetsrevisjon #2 — Matplan (April 2026)

**Dato:** 2026-04-02
**Revisor:** Claude Opus 4.6 (automatisert, 1M kontekst)
**Applikasjon:** Matplan — Norsk ukemeny- og budsjettplanlegger
**Stack:** Next.js 15, PostgreSQL (Neon), NextAuth.js v5-beta, Vercel Hobby
**URL:** https://matplan-one.vercel.app
**Omfang:** Full kodegjennomgang av 89 kildefiler (15 578 LOC), 326 tester, 37 skills
**Metode:** Statisk analyse, dataflytsporing, avhengighetsgjennomgang, 409 search refinements
**Forrige revisjon:** [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) (2026-04-02, revisjon #1)

---

## Sammendrag (Executive Summary)

Denne andre sikkerhetsrevisjonen ble utfort etter at alle HIGH- og MEDIUM-funn fra revisjon #1 ble utbedret. Kodebasen har vokst betydelig (89 filer, 15 578 linjer, 37 skills) og dekker na alle 6 faser av applikasjonen.

Revisjonen identifiserte **18 funn**: **3 HIGH**, **6 MEDIUM**, **6 LOW**, og **3 INFO**. De tre HIGH-funnene gjelder Server-Side Request Forgery (SSRF) via URL-import og manglende eierskapsvalidering av budsjettkategorier. Disse kan utnyttes til a lese interne sky-metadata eller krysskontaminere data mellom husholdninger.

Positive funn inkluderer konsekvent `householdId`-isolering pa tvers av alle serverhandlinger, ingen SQL-injeksjon (Drizzle ORM), ingen XSS, sterk token-sikkerhet, og databasebaserte sesjoner.

| Alvorlighetsgrad | Antall | Status |
|-------------------|--------|--------|
| HIGH              | 3      | Apen — krever umiddelbar utbedring |
| MEDIUM            | 6      | Apen — planlegg utbedring |
| LOW               | 6      | Apen — aksepter eller utbedr ved anledning |
| INFO              | 3      | Dokumentert — ingen handling pakreves |

---

## Testdekning

### Overordnet dekning

| Metrikk     | Dekning  | Vurdering |
|-------------|----------|-----------|
| Statements  | 82.5%    | God       |
| Branches    | 61.9%    | Utilstrekkelig — forbedring anbefalt |
| Functions   | 86.5%    | God       |
| Lines       | 82.1%    | God       |

### Dekning per modul

| Modul                        | Statements | Branches | Functions | Lines  | Kommentar |
|------------------------------|------------|----------|-----------|--------|-----------|
| `lib/` (forretningslogikk)   | 95%+       | 85%+     | 95%+      | 95%+   | Godt dekket, spesielt ernaering og budsjett |
| `price-api/`                 | ~80%       | ~65%     | ~85%      | ~80%   | Dual provider-logikk trenger mer branch-testing |
| `recipe-api/`                | ~70%       | ~50%     | ~75%      | ~70%   | URL-import og Spoonacular delvis dekket |
| `app/(app)/*/actions.ts`     | ~80%       | ~55%     | ~85%      | ~80%   | Server actions — branch-dekning for feilhåndtering lav |
| `app/api/`                   | ~75%       | ~50%     | ~80%      | ~75%   | API-ruter — shared link toggle mangler edge cases |
| `db/`                        | ~85%       | ~70%     | ~90%      | ~85%   | Schema og queries godt dekket |
| `components/`                | ~60%       | ~40%     | ~65%      | ~60%   | UI-komponenter har lavest dekning |

**Totalt:** 326 tester passerer. Branch-dekning pa 61.9% er hovedsakelig lavere pga. manglende testing av feilstier og edge cases i server actions.

---

## Funn — Oversikt

| #  | Alvorlighet | Funn                                           | Lokasjon                                        | Status |
|----|-------------|------------------------------------------------|------------------------------------------------|--------|
| 1  | **HIGH**    | SSRF via URL-reseptimport                      | `url-import.ts:24`, `actions.ts:29`            | Apen   |
| 2  | **HIGH**    | Manglende categoryId-eierskap i addExpense     | `budsjett/actions.ts:96-109`                   | Apen   |
| 3  | **HIGH**    | Manglende categoryId-eierskap i importShoppingListAsExpense | `budsjett/actions.ts:176-208`     | Apen   |
| 4  | MEDIUM      | Ingen URL-validering pa import-action          | `url-import/actions.ts:29`                     | Apen   |
| 5  | MEDIUM      | Uvalidert JSON.parse av ingredienser           | `oppskrifter/actions.ts:101,164`               | Apen   |
| 6  | MEDIUM      | Ingen middleware-nivå autentisering             | `src/middleware.ts` (mangler)                  | Apen   |
| 7  | MEDIUM      | .env-filer i prosjektmappen                    | `.env`, `.env.local`                           | Apen   |
| 8  | MEDIUM      | Shared link toggle API mangler CSRF            | `api/shared/[token]/toggle/route.ts`           | Apen   |
| 9  | MEDIUM      | Ingen hastighetsbegrensning                    | Alle server actions og API-ruter               | Apen   |
| 10 | LOW         | eventType castet som `any`                     | `kalender/actions.ts:136,163`                  | Apen   |
| 11 | LOW         | Innstillinger aksepterer vilkarlige enum-verdier | `innstillinger/actions.ts:39-41`             | Apen   |
| 12 | LOW         | Ingen validering av inputlengde                | Alle tekstfelt                                 | Apen   |
| 13 | LOW         | deleteAccount sletter delt husholdning         | `innstillinger/actions.ts:57-123`              | Apen   |
| 14 | LOW         | Heltallsoverflyt i ore-beregninger             | Teoretisk                                      | Apen   |
| 15 | LOW         | NextAuth beta-avhengighet                      | `package.json`                                 | Apen   |
| 16 | INFO        | Spoonacular API-nokkel i URL-parametere        | `spoonacular.ts:74,97`                         | Notert |
| 17 | INFO        | Googlebot UA-spoofing                          | `url-import.ts:25-27`                          | Notert |
| 18 | INFO        | Ingen tilbakekalling av delte lenker           | Delt lenke-funksjonalitet                      | Notert |

---

## Detaljerte funn

---

### HIGH-1: SSRF via URL-reseptimport

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | HIGH |
| **Lokasjon**    | `src/recipe-api/url-import.ts:24`, `src/app/(app)/oppskrifter/url-import/actions.ts:29` |
| **Kategori**    | Server-Side Request Forgery (SSRF) |
| **CWE**         | CWE-918 |

**Beskrivelse:**
Funksjonen `importRecipeFromUrl` henter innholdet fra en vilkarlig URL uten noen form for validering. En angriper kan oppgi interne nettverksadresser for a sonde interne tjenester, lese sky-metadata, eller utfore portskanning.

Selv om Vercel serverless-miljoet begrenser tilgangen til interne nettverk noe, er cloud provider metadata-endepunkter (AWS/GCP/Azure) tilgjengelige fra serverless-funksjoner og kan eksponere sensitive legitimasjoner.

**Pavirkning:**
- Lesing av sky-metadata (IAM-roller, midlertidige legitimasjoner)
- Sondring av interne tjenester pa `localhost` eller private IP-omrader
- Potensiell tilgang til andre Vercel-kunders tjenester via interne ruter

**Proof of Concept:**
```typescript
// Angriper kaller server action med:
importFromUrl("http://169.254.169.254/latest/meta-data/iam/security-credentials/")

// Andre farlige URLer:
importFromUrl("http://localhost:5432/") // Databaseport
importFromUrl("http://10.0.0.1/admin")  // Internt nettverk
importFromUrl("http://metadata.google.internal/computeMetadata/v1/") // GCP
```

**Utbedring:**
Implementer en URL-valideringsfunksjon som kjorer for fetch:

```typescript
function validateImportUrl(url: string): { valid: boolean; error?: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Ugyldig URL" };
  }

  // Kun HTTPS
  if (parsed.protocol !== "https:") {
    return { valid: false, error: "Kun HTTPS-URLer er tillatt" };
  }

  // Blokker private IP-omrader
  const hostname = parsed.hostname;
  const blocked = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\./,
    /^metadata\.google\.internal$/i,
    /\.internal$/i,
  ];

  if (blocked.some(pattern => pattern.test(hostname))) {
    return { valid: false, error: "Intern adresse er ikke tillatt" };
  }

  return { valid: true };
}
```

---

### HIGH-2: Manglende categoryId-eierskap i addExpense

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | HIGH |
| **Lokasjon**    | `src/app/(app)/budsjett/actions.ts:96-109` |
| **Kategori**    | Broken Access Control |
| **CWE**         | CWE-639 (Insecure Direct Object Reference) |

**Beskrivelse:**
Server action `addExpense` aksepterer en `categoryId` fra klienten og setter den rett inn i databasen uten a verifisere at kategorien tilhorer innlogget brukers husholdning. En angriper som kjenner eller gjetter en annen husholdnings `categoryId` kan sette inn budsjettoppforinger i deres kategorier.

**Pavirkning:**
- Krysskontaminering av budsjettdata mellom husholdninger
- Angriper kan fylle andres budsjettkategorier med falske utgifter
- Brudd pa dataisolering mellom husholdninger

**Proof of Concept:**
```typescript
// Angriper kjenner categoryId fra en annen husholdning (f.eks. UUID fra nettverk-trafikk)
await addExpense({
  categoryId: "andre-husholdnings-kategori-id",
  description: "Falsk utgift",
  amountOre: 999900,
  date: "2026-04-01"
});
// Utgiften legges til i offerets budsjettkategori
```

**Utbedring:**
Legg til eierskapsverifikasjon for hvert kall:

```typescript
export async function addExpense(data: ExpenseInput) {
  const householdId = await getHouseholdId();

  // Verifiser at kategorien tilhorer husholdningen
  const category = await db.query.budgetCategories.findFirst({
    where: and(
      eq(budgetCategories.id, data.categoryId),
      eq(budgetCategories.householdId, householdId)
    ),
  });

  if (!category) {
    return { error: "Kategori ikke funnet" };
  }

  // ... resten av innsettingen
}
```

---

### HIGH-3: Manglende categoryId-eierskap i importShoppingListAsExpense

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | HIGH |
| **Lokasjon**    | `src/app/(app)/budsjett/actions.ts:176-208` |
| **Kategori**    | Broken Access Control |
| **CWE**         | CWE-639 (Insecure Direct Object Reference) |

**Beskrivelse:**
Identisk sarbarhet som HIGH-2, men i funksjonen `importShoppingListAsExpense`. Denne funksjonen importerer handleliste-elementer som budsjettutgifter, og aksepterer en `categoryId` uten a verifisere eierskap.

**Pavirkning:**
Samme som HIGH-2. Bulkimport gjor det mulig a injisere flere falske oppforinger pa en gang.

**Proof of Concept:**
```typescript
await importShoppingListAsExpense({
  categoryId: "andre-husholdnings-kategori-id",
  listId: "egen-liste-id" // Egen handleliste
});
// Alle varer fra egen handleliste importeres som utgifter i offerets kategori
```

**Utbedring:**
Samme monster som HIGH-2 — verifiser `categoryId` eierskap for innsetting:

```typescript
const category = await db.query.budgetCategories.findFirst({
  where: and(
    eq(budgetCategories.id, data.categoryId),
    eq(budgetCategories.householdId, householdId)
  ),
});
if (!category) return { error: "Kategori ikke funnet" };
```

---

### MEDIUM-4: Ingen URL-validering pa import-action

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | MEDIUM |
| **Lokasjon**    | `src/app/(app)/oppskrifter/url-import/actions.ts:29` |
| **Kategori**    | Input Validation |
| **CWE**         | CWE-20 |

**Beskrivelse:**
Server action-laget for URL-import utforer ingen validering av URL-en for den sendes videre til `importRecipeFromUrl`. Selv om kjernesarbarheten er SSRF (HIGH-1), representerer mangelen pa validering i action-laget et ekstra forsvarsniva som mangler (defense in depth).

**Pavirkning:**
- Ingen forsvarsdybde — eneste forsvar er i den underliggende funksjonen (som ogsa mangler)
- Ugyldig input nar ukontrollert til fetch

**Utbedring:**
Legg til URL-validering i server action for kallet til `importRecipeFromUrl`:

```typescript
export async function importFromUrl(url: string) {
  const validation = validateImportUrl(url);
  if (!validation.valid) {
    return { error: validation.error };
  }
  return importRecipeFromUrl(url);
}
```

---

### MEDIUM-5: Uvalidert JSON.parse av ingredienser

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | MEDIUM |
| **Lokasjon**    | `src/app/(app)/oppskrifter/actions.ts:101,164` |
| **Kategori**    | Error Handling |
| **CWE**         | CWE-20, CWE-755 |

**Beskrivelse:**
`JSON.parse(ingredientsJson)` kalles uten try/catch og uten skjemavalidering av det parsede resultatet. Ugyldig JSON forarsaker en uhandtert unntak som resulterer i en 500-feil. Selv med gyldig JSON valideres ikke strukturen — en angriper kan sende et objekt med uventede felt.

**Pavirkning:**
- 500-feil for sluttbrukere ved ugyldig input
- Potensielt uventede datatyper i databasen
- Prototype pollution (lavt, men teoretisk ved manglende validering)

**Proof of Concept:**
```typescript
// Sender ugyldig JSON:
await saveRecipe({ ingredientsJson: "{ ugyldig json }", ... });
// Resultat: Unhandled error, 500 status

// Sender gyldig JSON med uventet struktur:
await saveRecipe({ ingredientsJson: '{"__proto__": {"admin": true}}', ... });
```

**Utbedring:**
```typescript
let ingredients: Ingredient[];
try {
  const parsed = JSON.parse(ingredientsJson);
  if (!Array.isArray(parsed)) {
    return { error: "Ingredienser ma vaere en liste" };
  }
  ingredients = parsed.map(validateIngredient); // Zod eller manuell validering
} catch {
  return { error: "Ugyldig ingrediensformat" };
}
```

---

### MEDIUM-6: Ingen middleware-nivå autentisering

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | MEDIUM |
| **Lokasjon**    | `src/middleware.ts` (mangler) |
| **Kategori**    | Authentication |
| **CWE**         | CWE-306 |

**Beskrivelse:**
Det finnes ingen `src/middleware.ts`. Autentisering haandteres kun via layout-redirect i rotoppsettet, og server-komponenter bruker `session!.user!.id!` med non-null assertions. Dersom en rute ved en feiltakelse ikke inkluderer layouten, eller en ny API-rute opprettes uten auth-sjekk, vil den vaere apen.

**Pavirkning:**
- Nye ruter kan bli eksponert uten autentisering ved en feiltakelse
- Non-null assertions (`!`) kaster ukryptiske feil i stedet for a returnere 401
- Ingen sentralisert sikkerhetshåndhevelse

**Utbedring:**
Opprett `src/middleware.ts` med NextAuth:

```typescript
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/(app)/:path*", "/api/:path*"],
};
```

Alternativt, opprett en custom middleware som sjekker sesjon og redirecter til `/login` for uautentiserte brukere.

---

### MEDIUM-7: .env-filer i prosjektmappen

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | MEDIUM |
| **Lokasjon**    | `.env`, `.env.local` (prosjektrot) |
| **Kategori**    | Secrets Management |
| **CWE**         | CWE-312 |

**Beskrivelse:**
Bade `.env` og `.env.local` finnes i prosjektmappen. `.gitignore` inneholder `.env*` som skal forhindre at de committes til versjonskontroll — men de eksisterer pa disk og kan potensielt bli inkludert ved feilkonfigurasjon, ved bruk av `git add -f`, eller ved deling av prosjektmappen.

**Pavirkning:**
- Risiko for utilsiktet eksponering av hemmeligheter
- `DATABASE_URL`, `AUTH_SECRET`, API-nokler kan lekke

**Utbedring:**
1. Verifiser at `.env*` er i `.gitignore` (bekreftet ✅)
2. Kjor `git status` regelmessig for a verifisere at .env-filer ikke spores
3. Vurder a bruke Vercel Environment Variables eksklusivt og fjern lokale .env-filer
4. Legg til en pre-commit hook som blokkerer .env-filer:
```bash
# .husky/pre-commit
if git diff --cached --name-only | grep -q '\.env'; then
  echo "FEIL: .env-filer skal ikke committes!"
  exit 1
fi
```

---

### MEDIUM-8: Shared link toggle API mangler CSRF

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | MEDIUM |
| **Lokasjon**    | `src/app/api/shared/[token]/toggle/route.ts` |
| **Kategori**    | Cross-Site Request Forgery |
| **CWE**         | CWE-352 |

**Beskrivelse:**
API-ruten for a toggle-markere varer i delt handleliste er en ra Route Handler uten CSRF-beskyttelse. Next.js' innebygde CSRF-beskyttelse gjelder kun for Server Actions, ikke for Route Handlers. Token-entropien (122-bit UUID) gir betydelig mitigering — en angriper ma kjenne tokenet for a utnytte dette — men en ondsinnet lenke eller bilde-tag kan utlose toggle dersom tokenet er kjent.

**Pavirkning:**
- Lav sannsynlighet (krever kjennskap til token)
- Toggle av handleliste-varer uten brukerens samtykke

**Utbedring:**
Legg til Origin-header-sjekk i route handler:
```typescript
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== process.env.NEXTAUTH_URL) {
    return new Response("Forbidden", { status: 403 });
  }
  // ... resten
}
```

---

### MEDIUM-9: Ingen hastighetsbegrensning (Rate Limiting)

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | MEDIUM |
| **Lokasjon**    | Alle server actions og API-ruter |
| **Kategori**    | Availability |
| **CWE**         | CWE-770 |

**Beskrivelse:**
Ingen applikasjonsniva hastighetsbegrensning er implementert. Alle server actions og API-ruter kan kalles ubegrenset. Dette gir risiko for:
- Uttomming av Kassalapp API-kvote (60 foresporsler/min)
- Uttomming av Spoonacular API-kvote (150 foresporsler/dag)
- Generelt overforbruk av serverressurser

Vercel gir noe DDoS-beskyttelse pa infrastrukturniva, men applikasjonsniva-begrensninger mangler.

**Pavirkning:**
- API-kvoter kan tommes, noe som pavirker alle brukere
- Okonomisk risiko dersom kvotene utvides til betalte planer
- Denial of service for andre brukere

**Utbedring:**
Implementer `@upstash/ratelimit` med Vercel KV:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

// I server action:
const { success } = await ratelimit.limit(userId);
if (!success) return { error: "For mange forsok. Prov igjen om litt." };
```

**Prioriterte endepunkter:**

| Endepunkt | Anbefalt grense |
|-----------|-----------------|
| `searchSpoonacular` | 10/min per bruker |
| `importFromUrl` | 5/min per bruker |
| `generateShoppingList` | 10/min per bruker |
| `/api/shared/[token]/toggle` | 30/min per token |

---

### LOW-10: eventType castet som `any`

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | LOW |
| **Lokasjon**    | `src/app/(app)/kalender/actions.ts:136,163` |
| **Kategori**    | Input Validation |
| **CWE**         | CWE-20 |

**Beskrivelse:**
`eventType` mottas fra klienten og brukes uten server-side validering av at verdien er en gyldig enum. En angriper kan sende vilkarlige strenger som lagres i databasen.

**Pavirkning:**
- Uventede verdier i databasen
- Potensielle feil i UI ved visning av ukjente event-typer
- Lav sikkerhetsrisiko, men brudd pa dataintegriteten

**Utbedring:**
```typescript
const validEventTypes = ["meal", "event", "fish"] as const;
if (!validEventTypes.includes(eventType)) {
  return { error: "Ugyldig hendelsestype" };
}
```

---

### LOW-11: Innstillinger aksepterer vilkarlige enum-verdier

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | LOW |
| **Lokasjon**    | `src/app/(app)/innstillinger/actions.ts:39-41` |
| **Kategori**    | Input Validation |
| **CWE**         | CWE-20 |

**Beskrivelse:**
Brukerinnstillinger (tema, sprak, prisleverandor) aksepteres uten a validere at verdiene er gyldige enum-verdier. En angriper kan lagre vilkarlige strenger.

**Pavirkning:**
- Uventede verdier i brukerinnstillinger
- Potensielle feil ved lasting av innstillinger
- Lav sikkerhetsrisiko

**Utbedring:**
Legg til enum-validering med Zod eller manuell sjekk:
```typescript
const themeSchema = z.enum(["light", "dark", "system"]);
const priceProviderSchema = z.enum(["kassalapp", "oda"]);
```

---

### LOW-12: Ingen validering av inputlengde

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | LOW |
| **Lokasjon**    | Alle server actions som aksepterer tekst |
| **Kategori**    | Input Validation |
| **CWE**         | CWE-20 |

**Beskrivelse:**
Ingen server actions validerer lengden pa tekstinput (oppskriftsnavn, beskrivelser, instruksjoner, kategorinavn, etc.). En angriper kan sende ekstremt lange strenger.

**Pavirkning:**
- Potensielt store databaseoppforinger
- Treg rendering av sider med ekstremt lange verdier
- Neon har egne rad-grenser som gir noe beskyttelse

**Utbedring:**
Definer maksimallengder og valider i alle server actions:
```typescript
if (name.length > 200) return { error: "Navn for langt (maks 200 tegn)" };
if (description.length > 5000) return { error: "Beskrivelse for lang (maks 5000 tegn)" };
if (instructions.length > 20000) return { error: "Instruksjoner for lange" };
```

---

### LOW-13: deleteAccount sletter delt husholdning

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | LOW |
| **Lokasjon**    | `src/app/(app)/innstillinger/actions.ts:57-123` |
| **Kategori**    | Business Logic |
| **CWE**         | CWE-708 |

**Beskrivelse:**
`deleteAccount` sletter alle data i husholdningen (oppskrifter, menyplaner, budsjetter, handlelister, kalenderoppforinger) uten a sjekke om andre medlemmer finnes. Dersom husholdningen deles med andre brukere, mister de all data.

**Pavirkning:**
- Datatap for andre husholdningsmedlemmer
- Ingen bekreftelse om at husholdningen deles

**Utbedring:**
```typescript
const members = await db.query.users.findMany({
  where: eq(users.householdId, householdId),
});

if (members.length > 1) {
  // Alternativ 1: Overfør eierskap
  // Alternativ 2: Fjern bare brukerens tilknytning
  // Alternativ 3: Vis advarsel og krev bekreftelse
  return { error: "Husholdningen har andre medlemmer. Overfør eierskap forst." };
}
```

---

### LOW-14: Heltallsoverflyt i ore-beregninger

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | LOW |
| **Lokasjon**    | Teoretisk — alle budsjettberegninger |
| **Kategori**    | Numeric |
| **CWE**         | CWE-190 |

**Beskrivelse:**
Alle belop lagres i heltalls ore (f.eks. 4990 = kr 49,90). JavaScript's `Number.MAX_SAFE_INTEGER` (2^53 - 1) tilsvarer ~90 071 992 547 409 kr, som er langt over realistiske verdier. Likevel, ved aggregering av mange poster over tid, eller ved ondsinnet input av ekstremt store tall, kan presisjon ga tapt.

**Pavirkning:**
- Teoretisk — reelt sett kreves budsjetter pa hundrevis av milliarder NOK
- Ingen praktisk risiko for en husholdningsapp

**Utbedring:**
Legg til maks-verdi-validering:
```typescript
const MAX_AMOUNT_ORE = 100_000_000_00; // 100 millioner kr
if (amountOre > MAX_AMOUNT_ORE) return { error: "Belop for stort" };
```

---

### LOW-15: NextAuth beta-avhengighet

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | LOW |
| **Lokasjon**    | `package.json` |
| **Kategori**    | Supply Chain |
| **CWE**         | CWE-1104 |

**Beskrivelse:**
Prosjektet bruker `next-auth@^5.0.0-beta.30`. Beta-versjoner kan inneholde sikkerhetsfeil som ikke har fatt full oppmerksomhet, og API-et kan endre seg uten forvarsel. NextAuth v5 har vaert i beta i over et ar.

**Pavirkning:**
- Potensielle uoppdagede sikkerhetsfeil i beta-kode
- API-endringer ved oppgradering
- Ingen garanti for sikkerhetspatcher

**Utbedring:**
- Oppgrader til stabil versjon nar tilgjengelig
- Folg NextAuth GitHub for sikkerhetsadvarsler
- Vurder a pinne eksakt versjon i stedet for `^`-range

---

### INFO-16: Spoonacular API-nokkel i URL-parametere

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | INFO |
| **Lokasjon**    | `src/recipe-api/spoonacular.ts:74,97` |
| **Kategori**    | Information Exposure |
| **CWE**         | CWE-598 |

**Beskrivelse:**
Spoonacular API krever at API-nokkelen sendes som URL-parameter (`apiKey=...`). Dette er Spoonaculars egen designbeslutning og kan ikke endres. Nokkelen kan dukke opp i Vercel-logger og nettverkslogger.

**Pavirkning:**
- Ingen direkte sarbarhet — nokkelen brukes kun server-side
- Noen loggsystemer logger fulle URLer

**Tiltak:**
Dokumentert. Ingen handling pakreves. Vurder a filtrere API-nokler fra logger.

---

### INFO-17: Googlebot UA-spoofing

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | INFO |
| **Lokasjon**    | `src/recipe-api/url-import.ts:25-27` |
| **Kategori**    | Ethical Considerations |

**Beskrivelse:**
URL-importen bruker en Googlebot User-Agent-streng for a fa tilgang til oppskriftssider som blokkerer ukjente boter. Enkelte nettsteder kan returnere mer data (eller annen data) til Googlebot enn til vanlige besokende.

**Pavirkning:**
- Kan bryte med nettsteder sine bruksvilkar
- Kan utlose sikkerhetstiltak fra nettsteder
- Ingen direkte sikkerhetsrisiko for Matplan

**Tiltak:**
Dokumentert. Vurder a bruke en mer ærlig User-Agent med kontaktinformasjon.

---

### INFO-18: Ingen tilbakekalling av delte lenker

| Felt            | Verdi |
|-----------------|-------|
| **Alvorlighet** | INFO |
| **Lokasjon**    | Delt lenke-funksjonalitet |
| **Kategori**    | Feature Gap |

**Beskrivelse:**
Det finnes ingen funksjonalitet for a tilbakekalle (revoke) en delt lenke for den gar ut etter 7 dager. Dersom en bruker deler en lenke ved en feil, kan den ikke deaktiveres manuelt.

**Pavirkning:**
- Delt lenke forblir aktiv i opptil 7 dager
- 122-bit token-entropi gjor gjetting upraktisk
- Kun lesetilgang + toggle (ikke sletting eller endring)

**Tiltak:**
Dokumentert. Anbefalt a legge til en "Tilbakekall lenke"-knapp i brukergrensesnittet.

---

## Positive funn

Revisjonen identifiserte flere sterke sikkerhetsmoonstre i kodebasen:

| #  | Funn | Detaljer |
|----|------|----------|
| P1 | **Konsekvent householdId-isolering** | Alle server actions bruker `getHouseholdId()` og filtrerer data pa husholdningsniva. Ingen direkte brukertilgang til andre husholdningers data (unntatt HIGH-2/3). |
| P2 | **Ingen SQL-injeksjon** | Drizzle ORM brukes eksklusivt med parameteriserte sporringer. Ingen rå SQL-strenger funnet i hele kodebasen. |
| P3 | **Ingen XSS** | Ingen bruk av `dangerouslySetInnerHTML`. All brukerdata rendres via JSX-interpolering som automatisk escaper HTML-entiteter. |
| P4 | **Sterk token-sikkerhet** | Delte lenker bruker `crypto.randomUUID()` (122-bit entropi) med 7-dagers utlopstid. Tokenet verifiseres bade pa sidelasting og i API-ruter. |
| P5 | **Vareeierskapsverifisering** | `verifyItemOwnership()` brukes konsekvent pa alle handleliste-mutasjoner, og verifiserer item -> liste -> husholdning-kjeden. |
| P6 | **Databasesesjoner** | Bruker databaselagrede sesjoner (ikke JWT), noe som gjor det mulig a ugyldiggjore sesjoner server-side. |
| P7 | **CSRF-beskyttelse pa server actions** | Next.js' innebygde Origin-header-sjekk beskytter alle server actions mot CSRF-angrep. |
| P8 | **Hemmeligheter utenfor versjonskontroll** | `.env*` er i `.gitignore`. Ingen `NEXT_PUBLIC_`-prefiksede miljøvariabler eksponerer hemmeligheter til klienten. |

---

## Prioritert utbedringsplan

Anbefalt rekkefølge for utbedring, basert pa risiko og innsats:

| Prioritet | Funn | Innsats | Begrunnelse |
|-----------|------|---------|-------------|
| 1 | HIGH-2, HIGH-3 | Lav (15 min) | En ekstra database-sjekk i to funksjoner. Hoyest risiko, lavest innsats. |
| 2 | HIGH-1 + MEDIUM-4 | Middels (30 min) | URL-valideringsfunksjon + integrering i bade `url-import.ts` og action-laget. |
| 3 | MEDIUM-6 | Middels (30 min) | Opprett `middleware.ts` med auth-sjekk. Forebygger fremtidige feil. |
| 4 | MEDIUM-5 | Lav (15 min) | Legg til try/catch og Zod-skjema for ingredienser. |
| 5 | MEDIUM-9 | Hoy (2-4 timer) | Krever oppsett av Upstash/KV og integrering i flere endepunkter. |
| 6 | MEDIUM-8 | Lav (10 min) | Legg til Origin-sjekk i route handler. |
| 7 | LOW-12 | Middels (1 time) | Gjennomga alle server actions og legg til lengdevalidering. |
| 8 | LOW-13 | Lav (20 min) | Legg til medlemssjekk for sletting. |
| 9 | LOW-10, LOW-11 | Lav (15 min) | Legg til enum-validering i kalender og innstillinger. |
| 10 | MEDIUM-7 | Lav (10 min) | Legg til pre-commit hook. |
| 11 | LOW-15 | Avvent | Oppgrader nar stabil versjon er tilgjengelig. |
| 12 | LOW-14 | Lav (5 min) | Legg til maks-verdi-sjekk. |

**Estimert total innsats:** ~5-6 timer for alle funn.

---

## Sammenligning med revisjon #1

| Aspekt | Revisjon #1 | Revisjon #2 |
|--------|-------------|-------------|
| **Dato** | 2026-04-02 | 2026-04-02 |
| **Kildefiler** | Ikke talt | 89 |
| **Kodelinjer** | Ikke talt | 15 578 |
| **Tester** | 143 | 326 (+128%) |
| **Skills** | 34 | 37 |
| **Funn totalt** | 9 | 18 |
| **HIGH** | 4 | 3 |
| **MEDIUM** | 3 | 6 |
| **LOW** | 2 | 6 |
| **INFO** | 0 | 3 |

### Utbedrede funn fra revisjon #1

| Revisjon #1 funn | Status i revisjon #2 |
|-------------------|----------------------|
| HIGH: toggleItem/updateItemPrice/removeItem uten auth | ✅ Utbedret — `verifyItemOwnership()` implementert |
| HIGH: addItem uten listId-eierskapssjekk | ✅ Utbedret |
| HIGH: Shared link toggle kunne endre vilkarlig liste | ✅ Utbedret — verifiserer `shoppingListId === link.resourceId` |
| HIGH: searchSpoonacular uten auth | ✅ Utbedret |
| MEDIUM: deleteCategory uten householdId-scope | ✅ Utbedret |
| MEDIUM: JSON.parse uten try/catch | Gjenfunnet som MEDIUM-5 |
| LOW: SSRF via URL-import | Oppgradert til HIGH-1 (dypere analyse) |
| LOW: Ingen URL-allowlist | Inkludert i HIGH-1 utbedring |
| LOW: Ingen rate limiting | Gjenfunnet som MEDIUM-9 |

### Nye funn i revisjon #2

Folgende funn er nye i denne revisjonen:
- HIGH-2, HIGH-3: categoryId-eierskap i budsjettmodulen (ny funksjonalitet)
- MEDIUM-6: Manglende middleware (dypere analyse)
- MEDIUM-7: .env-filer pa disk
- MEDIUM-8: CSRF pa route handler (dypere analyse)
- LOW-10 til LOW-15: Diverse inputvalidering og logikk-funn
- INFO-16 til INFO-18: Dokumenterte observasjoner

---

## Statistikk

| Metrikk | Verdi |
|---------|-------|
| Tester kjort | 326 |
| Kodelinjer (LOC) | 15 578 |
| Kildefiler analysert | 89 |
| Skills brukt | 37 |
| Sokeforfineringer | 409 |
| Funn totalt | 18 |
| Kritiske funn | 0 |
| Hoye funn | 3 |
| Medium funn | 6 |
| Lave funn | 6 |
| Informasjonsfunn | 3 |
| Positive funn | 8 |

---

## Metodologi

Denne revisjonen ble utfort som en automatisert statisk kodegjennomgang med folgende tilnærming:

1. **Fullstendig filgjennomgang:** Alle 89 kildefiler ble lest og analysert
2. **Dataflytsporing:** Brukerinput ble sporet fra klient til database gjennom alle server actions
3. **Autorisasjonssjekk:** Hver server action ble verifisert for autentisering og husholdningsisolering
4. **Avhengighetsgjennomgang:** `package.json` og `package-lock.json` ble gjennomgatt for kjente sarbarheter
5. **Konfigurasjonsjekk:** Next.js-konfigurasjon, miljøvariabler og .gitignore ble verifisert
6. **Sammenligning:** Funn ble kryssjekket mot revisjon #1 for a spore utbedring

Begrensninger:
- Ingen dynamisk testing (DAST) ble utfort
- Ingen penetrasjonstesting mot produksjonsmiljo
- Avhengigheter ble ikke sjekket mot CVE-databaser (anbefal `npm audit`)

---

*Generert av Claude Opus 4.6 (1M context) — automatisert sikkerhetsrevisjon*
*Neste revisjon anbefales etter utbedring av HIGH-funn, eller ved neste store funksjonsutgivelse.*
