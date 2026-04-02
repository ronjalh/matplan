/**
 * URL Recipe Import — fetches a recipe page and extracts schema.org/Recipe JSON-LD.
 * Uses Googlebot user agent to get SSR version from sites like matprat.no.
 */

export interface ImportedRecipe {
  name: string;
  servings: number;
  prepTimeMinutes: number | null;
  instructions: string;
  ingredients: { text: string; quantity: number; unit: string; name: string }[];
  imageUrl: string | null;
  sourceUrl: string;
  isVegetarian: boolean;
  isFishMeal: boolean;
}

/**
 * Fetch and parse a recipe from a URL.
 * Supports any site with schema.org/Recipe JSON-LD (most recipe sites serve it to Googlebot).
 */
export async function importRecipeFromUrl(url: string): Promise<ImportedRecipe | null> {
  // Fetch with Googlebot UA to get SSR/JSON-LD version
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
      "Accept": "text/html",
    },
  });

  if (!res.ok) return null;

  const html = await res.text();

  // Extract JSON-LD blocks
  const ldMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  if (!ldMatches) return null;

  for (const match of ldMatches) {
    const jsonStr = match
      .replace(/<script[^>]*>/i, "")
      .replace(/<\/script>/i, "")
      .trim();

    try {
      let data = JSON.parse(jsonStr);

      // Handle @graph format
      if (data["@graph"]) {
        data = data["@graph"].find((item: any) =>
          typeof item["@type"] === "string" && item["@type"].includes("Recipe")
        );
      }

      // Handle array format
      if (Array.isArray(data)) {
        data = data.find((item: any) =>
          typeof item["@type"] === "string" && item["@type"].includes("Recipe")
        );
      }

      if (!data || !String(data["@type"] ?? "").includes("Recipe")) continue;

      // Parse ingredients
      const rawIngredients: string[] = data.recipeIngredient ?? [];
      const ingredients = rawIngredients.map(parseIngredientString);

      // Parse time (ISO 8601 duration: PT40M, PT1H30M)
      const prepTimeMinutes = parseISODuration(data.totalTime ?? data.cookTime ?? data.prepTime);

      // Parse servings
      const servingsStr = String(data.recipeYield ?? "4");
      const servings = parseInt(servingsStr.match(/\d+/)?.[0] ?? "4");

      // Parse instructions
      const instructions = parseInstructions(data.recipeInstructions ?? []);

      // Detect fish (no word boundaries — matches "laksfilet", "fiskefilet" etc.)
      const fishKeywords = /(salmon|cod\b|tuna|shrimp|prawn|fish|mackerel|trout|herring|haddock|halibut|laks|torsk|sei\b|seifilet|reke|tunfisk|makrell|ørret|sild|hyse|krabbe|fisk|kveite|steinbit|breiflabb|piggvar|sjøkreps|blåskjell|kamskjell|hummer|sjømat|klippfisk|lutefisk|skalldyr|kaviar)/i;
      const isFishMeal = rawIngredients.some((i) => fishKeywords.test(i))
        || fishKeywords.test(data.name ?? ""); // Also check recipe title

      // Detect vegetarian
      const meatKeywords = /(chicken|beef|pork|lamb|bacon|sausage|ham|turkey|kylling|kjøtt|svin|lam|skinke|pølse|karbonadedeig|ribbe|entrecote|indrefilet|biff|koteletter|kalkun|and\b|gås)/i;
      const isVegetarian = !rawIngredients.some((i) => meatKeywords.test(i)) && !isFishMeal;

      // Image
      const imageUrl = typeof data.image === "string"
        ? data.image
        : Array.isArray(data.image)
        ? data.image[0]
        : data.image?.url ?? null;

      return {
        name: data.name ?? "Ukjent oppskrift",
        servings,
        prepTimeMinutes,
        instructions,
        ingredients,
        imageUrl,
        sourceUrl: url,
        isVegetarian,
        isFishMeal,
      };
    } catch {
      continue;
    }
  }

  return null;
}

function parseIngredientString(text: string): { text: string; quantity: number; unit: string; name: string } {
  const cleaned = text.replace(/\s+/g, " ").trim();

  // Try to parse "2 ss olje" or "300 g kjøttdeig" or "1 stk. løk"
  const match = cleaned.match(/^([\d.,/]+)\s*(stk\.?|ss|ts|dl|l|ml|g|kg|båter|båt|boks|pose|pk|fedd|klype|neve)?\s*(.+)/i);

  if (match) {
    let qty = parseFloat(match[1].replace(",", "."));
    if (match[1].includes("/")) {
      const [num, den] = match[1].split("/");
      qty = parseInt(num) / parseInt(den);
    }
    const unit = (match[2] ?? "stk").replace(".", "");
    const name = match[3].trim();
    return { text: cleaned, quantity: qty, unit, name };
  }

  return { text: cleaned, quantity: 1, unit: "stk", name: cleaned };
}

function parseISODuration(duration: string | null | undefined): number | null {
  if (!duration) return null;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  return (parseInt(match[1] ?? "0") * 60) + parseInt(match[2] ?? "0");
}

function parseInstructions(instructions: any): string {
  if (typeof instructions === "string") return instructions;
  if (Array.isArray(instructions)) {
    return instructions
      .map((step, i) => {
        if (typeof step === "string") return `${i + 1}. ${step}`;
        if (step.text) return `${i + 1}. ${step.text}`;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}
