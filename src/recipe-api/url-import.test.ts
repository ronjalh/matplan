import { describe, it, expect } from "vitest";

// Import the function we're testing - we need to extract it for testing
// For now, replicate the logic to test it
function parseIngredientString(text: string): { text: string; quantity: number; unit: string; name: string } {
  const cleaned = text.replace(/\s+/g, " ").trim();

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

describe("parseIngredientString — matprat format", () => {
  describe("Basic Norwegian ingredients", () => {
    it("parses '2 ss smør'", () => {
      const r = parseIngredientString("2 ss smør");
      expect(r.quantity).toBe(2);
      expect(r.unit).toBe("ss");
      expect(r.name).toBe("smør");
    });

    it("parses '300 g kjøttdeig'", () => {
      const r = parseIngredientString("300 g kjøttdeig");
      expect(r.quantity).toBe(300);
      expect(r.unit).toBe("g");
      expect(r.name).toBe("kjøttdeig");
    });

    it("parses '3 dl vann'", () => {
      const r = parseIngredientString("3 dl vann");
      expect(r.quantity).toBe(3);
      expect(r.unit).toBe("dl");
      expect(r.name).toBe("vann");
    });
  });

  describe("stk. duplication problem", () => {
    it("parses '1 stk. løk' without duplicating stk", () => {
      const r = parseIngredientString("1 stk. løk");
      expect(r.unit).toBe("stk");
      expect(r.name).toBe("løk");
      expect(r.name).not.toContain("stk");
    });

    it("parses '1 stk. hakket løk' correctly", () => {
      const r = parseIngredientString("1 stk. hakket løk");
      expect(r.unit).toBe("stk");
      expect(r.name).toBe("hakket løk");
    });

    it("parses '2 stk. gulrot' correctly", () => {
      const r = parseIngredientString("2 stk. gulrot");
      expect(r.unit).toBe("stk");
      expect(r.name).toBe("gulrot");
    });
  });

  describe("Matprat-specific formats", () => {
    it("parses '2 båter finhakket hvitløk'", () => {
      const r = parseIngredientString("2 båter finhakket hvitløk");
      expect(r.quantity).toBe(2);
      expect(r.unit).toBe("båter");
      expect(r.name).toBe("finhakket hvitløk");
    });

    it("parses '1 boks hermetiske tomater'", () => {
      const r = parseIngredientString("1 boks hermetiske tomater");
      expect(r.quantity).toBe(1);
      expect(r.unit).toBe("boks");
      expect(r.name).toBe("hermetiske tomater");
    });

    it("parses '0,5 boks hermetiske maiskorn'", () => {
      const r = parseIngredientString("0,5 boks hermetiske maiskorn");
      expect(r.quantity).toBeCloseTo(0.5);
      expect(r.unit).toBe("boks");
      expect(r.name).toBe("hermetiske maiskorn");
    });

    it("parses '1 pose tacokrydder'", () => {
      const r = parseIngredientString("1 pose tacokrydder");
      expect(r.quantity).toBe(1);
      expect(r.unit).toBe("pose");
      expect(r.name).toBe("tacokrydder");
    });

    it("parses '1,5 kg potet'", () => {
      const r = parseIngredientString("1,5 kg potet");
      expect(r.quantity).toBeCloseTo(1.5);
      expect(r.unit).toBe("kg");
      expect(r.name).toBe("potet");
    });
  });

  describe("Edge cases from screenshot", () => {
    it("parses '1 stk stk jalapeno' should NOT happen", () => {
      // This tests that the PARSER doesn't create "stk jalapeno" as name
      // when input is "1 stk. jalapeno"
      const r = parseIngredientString("1 stk. jalapeño");
      expect(r.unit).toBe("stk");
      expect(r.name).toBe("jalapeño");
      expect(r.name).not.toMatch(/^stk/);
    });

    it("parses '2 stk. lime' correctly", () => {
      const r = parseIngredientString("2 stk. lime");
      expect(r.unit).toBe("stk");
      expect(r.name).toBe("lime");
    });

    it("parses '1 ts chipotle chilipulver'", () => {
      const r = parseIngredientString("1 ts chipotle chilipulver");
      expect(r.unit).toBe("ts");
      expect(r.name).toBe("chipotle chilipulver");
    });

    it("parses '400 g renstilet'", () => {
      const r = parseIngredientString("400 g gresstilet");
      expect(r.unit).toBe("g");
      expect(r.name).toBe("gresstilet");
    });

    it("parses '1 dl hvitvin (kan utelates)'", () => {
      const r = parseIngredientString("1 dl hvitvin (kan utelates)");
      expect(r.unit).toBe("dl");
      expect(r.name).toBe("hvitvin (kan utelates)");
    });
  });

  describe("No quantity — full text as name", () => {
    it("parses 'salt og pepper' as 1 stk", () => {
      const r = parseIngredientString("salt og pepper");
      expect(r.quantity).toBe(1);
      expect(r.unit).toBe("stk");
      expect(r.name).toBe("salt og pepper");
    });
  });
});
