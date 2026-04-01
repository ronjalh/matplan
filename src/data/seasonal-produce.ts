export type SeasonalStatus = "in-season" | "from-storage" | "imported";

export interface SeasonalProduce {
  name: string;
  nameEN: string;
  category: "groennsaker" | "frukt" | "baer" | "urter";
  /** Months when harvested in Norway (1=Jan, 12=Dec) */
  harvestMonths: number[];
  /** Available from Norwegian cold storage until this month */
  storedUntil?: number;
  region?: string;
}

export const seasonalProduce: SeasonalProduce[] = [
  // Grønnsaker
  { name: "Gulrot", nameEN: "Carrot", category: "groennsaker", harvestMonths: [7,8,9,10], storedUntil: 3 },
  { name: "Potet", nameEN: "Potato", category: "groennsaker", harvestMonths: [7,8,9,10], storedUntil: 4 },
  { name: "Kålrot", nameEN: "Swede", category: "groennsaker", harvestMonths: [9,10,11], storedUntil: 3 },
  { name: "Løk", nameEN: "Onion", category: "groennsaker", harvestMonths: [8,9,10], storedUntil: 3, region: "Vestfold, Rogaland" },
  { name: "Purre", nameEN: "Leek", category: "groennsaker", harvestMonths: [9,10,11], storedUntil: 1 },
  { name: "Blomkål", nameEN: "Cauliflower", category: "groennsaker", harvestMonths: [7,8,9,10], region: "Vestfold, Rogaland" },
  { name: "Brokkoli", nameEN: "Broccoli", category: "groennsaker", harvestMonths: [7,8,9] },
  { name: "Hodekål", nameEN: "Cabbage", category: "groennsaker", harvestMonths: [7,8,9,10,11], storedUntil: 3 },
  { name: "Rødkål", nameEN: "Red cabbage", category: "groennsaker", harvestMonths: [9,10,11], storedUntil: 2 },
  { name: "Grønnkål", nameEN: "Kale", category: "groennsaker", harvestMonths: [9,10,11,12] },
  { name: "Spinat", nameEN: "Spinach", category: "groennsaker", harvestMonths: [5,6,7,8,9,10] },
  { name: "Salat", nameEN: "Lettuce", category: "groennsaker", harvestMonths: [5,6,7,8,9,10] },
  { name: "Agurk", nameEN: "Cucumber", category: "groennsaker", harvestMonths: [5,6,7,8,9] },
  { name: "Tomat", nameEN: "Tomato", category: "groennsaker", harvestMonths: [6,7,8,9,10], region: "Drivhus, Rogaland" },
  { name: "Squash", nameEN: "Zucchini", category: "groennsaker", harvestMonths: [7,8,9] },
  { name: "Gresskar", nameEN: "Pumpkin", category: "groennsaker", harvestMonths: [9,10], storedUntil: 12 },
  { name: "Erter", nameEN: "Peas", category: "groennsaker", harvestMonths: [6,7,8] },
  { name: "Grønne bønner", nameEN: "Green beans", category: "groennsaker", harvestMonths: [7,8,9] },
  { name: "Rødbeter", nameEN: "Beetroot", category: "groennsaker", harvestMonths: [8,9,10], storedUntil: 2 },
  { name: "Sellerirot", nameEN: "Celeriac", category: "groennsaker", harvestMonths: [9,10,11], storedUntil: 2 },
  { name: "Pastinakk", nameEN: "Parsnip", category: "groennsaker", harvestMonths: [9,10,11], storedUntil: 2 },
  { name: "Nepe", nameEN: "Turnip", category: "groennsaker", harvestMonths: [7,8,9,10], storedUntil: 2 },
  { name: "Asparges", nameEN: "Asparagus", category: "groennsaker", harvestMonths: [5,6], region: "Vestfold" },
  { name: "Mais", nameEN: "Corn", category: "groennsaker", harvestMonths: [8,9], region: "Sørlandet" },

  // Frukt
  { name: "Epler", nameEN: "Apples", category: "frukt", harvestMonths: [8,9,10], storedUntil: 1, region: "Hardanger, Sogn, Telemark" },
  { name: "Pærer", nameEN: "Pears", category: "frukt", harvestMonths: [8,9,10], storedUntil: 11, region: "Hardanger, Sogn" },
  { name: "Plommer", nameEN: "Plums", category: "frukt", harvestMonths: [8,9], region: "Hardanger, Lier" },
  { name: "Kirsebær", nameEN: "Cherries", category: "frukt", harvestMonths: [7,8], region: "Hardanger" },
  { name: "Rabarbra", nameEN: "Rhubarb", category: "frukt", harvestMonths: [5,6,7] },

  // Bær
  { name: "Jordbær", nameEN: "Strawberries", category: "baer", harvestMonths: [6,7], region: "Vestfold, kort sesong" },
  { name: "Bringebær", nameEN: "Raspberries", category: "baer", harvestMonths: [7,8] },
  { name: "Blåbær", nameEN: "Blueberries", category: "baer", harvestMonths: [7,8,9] },
  { name: "Tyttebær", nameEN: "Lingonberries", category: "baer", harvestMonths: [8,9] },
  { name: "Multer", nameEN: "Cloudberries", category: "baer", harvestMonths: [7,8], region: "Nord-Norge, Trøndelag" },
  { name: "Rips", nameEN: "Redcurrants", category: "baer", harvestMonths: [7,8] },
  { name: "Solbær", nameEN: "Blackcurrants", category: "baer", harvestMonths: [7,8] },
  { name: "Stikkelsbær", nameEN: "Gooseberries", category: "baer", harvestMonths: [7,8] },

  // Urter
  { name: "Dill", nameEN: "Dill", category: "urter", harvestMonths: [6,7,8,9] },
  { name: "Persille", nameEN: "Parsley", category: "urter", harvestMonths: [5,6,7,8,9,10] },
  { name: "Gressløk", nameEN: "Chives", category: "urter", harvestMonths: [5,6,7,8,9,10] },
  { name: "Timian", nameEN: "Thyme", category: "urter", harvestMonths: [6,7,8,9] },
  { name: "Basilikum", nameEN: "Basil", category: "urter", harvestMonths: [6,7,8,9] },
];

/**
 * Get the seasonal status of a produce item for a given month.
 */
export function getSeasonalStatus(
  produce: SeasonalProduce,
  month: number
): SeasonalStatus {
  if (produce.harvestMonths.includes(month)) {
    return "in-season";
  }
  if (produce.storedUntil) {
    const lastHarvest = Math.max(...produce.harvestMonths);
    // Check if current month is between end of harvest and storedUntil
    if (lastHarvest < produce.storedUntil) {
      if (month > lastHarvest && month <= produce.storedUntil) return "from-storage";
    } else {
      // Storage wraps around year (e.g., harvest Oct, stored until Mar)
      if (month > lastHarvest || month <= produce.storedUntil) return "from-storage";
    }
  }
  return "imported";
}

/**
 * Get all produce that is in season or from storage for a given month.
 */
export function getAvailableProduce(month: number) {
  return seasonalProduce
    .map((p) => ({ ...p, status: getSeasonalStatus(p, month) }))
    .filter((p) => p.status !== "imported");
}
