import { describe, it, expect } from "vitest";

// Score how well a product name matches the search query
function scoreMatch(productName: string, searchTerms: string[]): number {
  const name = productName.toLowerCase();
  let score = 0;

  for (const term of searchTerms) {
    const t = term.toLowerCase();
    if (t.length < 2) continue;
    if (name.startsWith(t)) {
      score += 20; // Strong: product name STARTS with search term
    } else if (name.includes(t)) {
      // Check if it's after "i " or "&" (ingredient, not main product)
      const idx = name.indexOf(t);
      const before = name.slice(Math.max(0, idx - 3), idx);
      if (/\bi\s|&|med\s|\//.test(before)) {
        score += 2; // Weak: it's a sub-ingredient ("Makrell i Salsa")
      } else {
        score += 10;
      }
    }
  }

  // Penalize wrong product types
  const PENALTY_WORDS = ["sylte", "syltet", "hermetisk", "pulver", "tørket", "konsentr", "granulat", "dressing", "iskrem", "gele", "drops", "pastill", "pålegg", "smudi", "smoothie"];
  for (const pw of PENALTY_WORDS) {
    if (name.includes(pw) && !searchTerms.some(t => t.includes(pw))) score -= 15;
  }

  // Penalize bulk/commercial
  if (/\b(\d+\s*x\s*\d+|storkjøkken|storhusholdning|catering|kasse)\b/i.test(name)) score -= 20;

  // Penalize baby food
  if (/\b(6mnd|8mnd|12mnd|barnegrøt|babymat)\b/i.test(name)) score -= 30;

  // Prefer shorter names (less noise)
  score -= name.length * 0.1;

  return score;
}

describe("scoreMatch — product relevance scoring", () => {
  it("prefers 'Agurk Norsk' over 'Nora Skivede Agurker'", () => {
    const fresh = scoreMatch("Agurk Norsk 1stk", ["agurk", "fersk"]);
    const pickled = scoreMatch("Nora Skivede Agurker 580g", ["agurk", "fersk"]);
    expect(fresh).toBeGreaterThan(pickled);
  });

  it("prefers 'Mango fersk' over 'Frukt&Grøt Mango 6mnd'", () => {
    const fresh = scoreMatch("Mango 1stk", ["mango", "fersk"]);
    const baby = scoreMatch("Frukt&Grøt Pære/Mango 6mnd 90g Lillego", ["mango", "fersk"]);
    expect(fresh).toBeGreaterThan(baby);
  });

  it("prefers 'Sitron løsvekt' over 'Gele Sitron Freia'", () => {
    const fresh = scoreMatch("Sitron løsvekt", ["sitron", "løsvekt"]);
    const gele = scoreMatch("Gele Sitron 125g Freia", ["sitron", "løsvekt"]);
    expect(fresh).toBeGreaterThan(gele);
  });

  it("penalizes baby food heavily", () => {
    const score = scoreMatch("Ris&Kylling 6mnd 120g Semper", ["ris"]);
    expect(score).toBeLessThan(0);
  });

  it("penalizes bulk packages", () => {
    const bulk = scoreMatch("Agurk Storkjøkken 10kg", ["agurk"]);
    const normal = scoreMatch("Agurk Norsk 1stk", ["agurk"]);
    expect(normal).toBeGreaterThan(bulk);
  });

  it("matches multiple search terms get higher score", () => {
    const bothMatch = scoreMatch("Helmelk Tine 1l", ["helmelk", "tine"]);
    const oneMatch = scoreMatch("Melk Lett 1l Q", ["helmelk", "tine"]);
    expect(bothMatch).toBeGreaterThan(oneMatch);
  });

  it("prefers 'Salsa Dip' over 'Makrell i Salsa'", () => {
    const dip = scoreMatch("Salsa Dip Medium 300g Santa Maria", ["salsa"]);
    const makrell = scoreMatch("Stabbur-Makrell Hakket i Salsa 110g Stabburet", ["salsa"]);
    expect(dip).toBeGreaterThan(makrell);
  });

  it("prefers 'Mango 1stk' over 'Smudi Pålegg Mango'", () => {
    const fresh = scoreMatch("Mango 1stk", ["mango", "fersk"]);
    const spread = scoreMatch("Smudi Pålegg Mango&Fersken 265g Lerum", ["mango", "fersk"]);
    expect(fresh).toBeGreaterThan(spread);
  });

  it("prefers product name starting with search term", () => {
    const starts = scoreMatch("Sesamfrø 100g", ["sesamfrø"]);
    const contains = scoreMatch("Granforno Grissini med Sesamfrø 125g", ["sesamfrø"]);
    expect(starts).toBeGreaterThan(contains);
  });
});

function isLikelyBulkPackage(name: string, weight?: number, weightUnit?: string): boolean {
  if (weight && weightUnit === "kg" && weight > 2) return true;
  if (weight && weightUnit === "g" && weight > 2000) return true;
  if (/\b(\d+\s*x\s*\d+|storkjøkken|storhusholdning|catering|kasse|storpack)\b/i.test(name)) return true;
  return false;
}

describe("isLikelyBulkPackage", () => {
  it("detects heavy packages", () => {
    expect(isLikelyBulkPackage("Agurk", 10, "kg")).toBe(true);
    expect(isLikelyBulkPackage("Agurk", 3000, "g")).toBe(true);
  });

  it("allows normal packages", () => {
    expect(isLikelyBulkPackage("Agurk Norsk 1stk", 0.35, "kg")).toBe(false);
    expect(isLikelyBulkPackage("Laksefilet 400g", 400, "g")).toBe(false);
  });

  it("detects commercial keywords", () => {
    expect(isLikelyBulkPackage("Agurk Storkjøkken 10kg")).toBe(true);
    expect(isLikelyBulkPackage("Tomat 6x400g catering")).toBe(true);
  });
});
