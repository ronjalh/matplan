/**
 * Curated Norwegian dinner recipes for auto-generate meal plan.
 * Based on common matprat.no / traditional Norwegian dinners.
 * These are used as a recipe pool when the user doesn't have enough own recipes
 * or wants variety from a broader set.
 *
 * IDs are negative to distinguish from user recipes (which have positive DB IDs).
 */

export interface MatpratRecipe {
  id: number;
  name: string;
  isFishMeal: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  cuisine: string | null;
  prepTimeMinutes: number | null;
}

export const matpratRecipes: MatpratRecipe[] = [
  // === FISK (10 oppskrifter) ===
  { id: -1, name: "Ovnsbakt laks med grønnsaker", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 35 },
  { id: -2, name: "Fiskesuppe med rømmeklatt", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 40 },
  { id: -3, name: "Fiskegrateng", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 50 },
  { id: -4, name: "Torsk med bacon og brokkoli", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 30 },
  { id: -5, name: "Laksewok med nudler", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Asiatisk", prepTimeMinutes: 25 },
  { id: -6, name: "Fish & chips", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Britisk", prepTimeMinutes: 45 },
  { id: -7, name: "Sei i karri", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 35 },
  { id: -8, name: "Laksetaco", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Meksikansk", prepTimeMinutes: 30 },
  { id: -9, name: "Rekesalat med brød", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 20 },
  { id: -10, name: "Pannestekt ørret med potetsalat", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 35 },

  // === KJØTT (15 oppskrifter) ===
  { id: -11, name: "Kyllinggryte med paprika", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 40 },
  { id: -12, name: "Taco med kjøttdeig", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Meksikansk", prepTimeMinutes: 30 },
  { id: -13, name: "Pasta bolognese", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Italiensk", prepTimeMinutes: 45 },
  { id: -14, name: "Kylling tikka masala", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Indisk", prepTimeMinutes: 40 },
  { id: -15, name: "Lasagne", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Italiensk", prepTimeMinutes: 60 },
  { id: -16, name: "Fårikål", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 120 },
  { id: -17, name: "Svinekoteletter med surkål", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 35 },
  { id: -18, name: "Wok med kylling og grønnsaker", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Asiatisk", prepTimeMinutes: 25 },
  { id: -19, name: "Kjøttkaker i brun saus", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 50 },
  { id: -20, name: "Biff stroganoff", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Russisk", prepTimeMinutes: 35 },
  { id: -21, name: "Kylling i pesto og mozzarella", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Italiensk", prepTimeMinutes: 30 },
  { id: -22, name: "Hjemmelaget pizza", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Italiensk", prepTimeMinutes: 45 },
  { id: -23, name: "Lammegryte med rotgrønnsaker", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 90 },
  { id: -24, name: "Burrito med kjøttdeig", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Meksikansk", prepTimeMinutes: 30 },
  { id: -25, name: "Thai grønn karri med kylling", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Thai", prepTimeMinutes: 30 },

  // === VEGETAR (15 oppskrifter) ===
  { id: -26, name: "Grønnsakssuppe", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Norsk", prepTimeMinutes: 35 },
  { id: -27, name: "Pasta med pesto og cherrytomater", isFishMeal: false, isVegetarian: true, isVegan: false, cuisine: "Italiensk", prepTimeMinutes: 20 },
  { id: -28, name: "Vegetar taco", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Meksikansk", prepTimeMinutes: 25 },
  { id: -29, name: "Risotto med sopp", isFishMeal: false, isVegetarian: true, isVegan: false, cuisine: "Italiensk", prepTimeMinutes: 40 },
  { id: -30, name: "Linsesuppe med brød", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Indisk", prepTimeMinutes: 35 },
  { id: -31, name: "Spinat- og ricottapasta", isFishMeal: false, isVegetarian: true, isVegan: false, cuisine: "Italiensk", prepTimeMinutes: 25 },
  { id: -32, name: "Vegetar wok med tofu", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Asiatisk", prepTimeMinutes: 25 },
  { id: -33, name: "Bakte søtpoteter med bønnechili", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Meksikansk", prepTimeMinutes: 45 },
  { id: -34, name: "Omelett med grønnsaker", isFishMeal: false, isVegetarian: true, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 15 },
  { id: -35, name: "Blomkål tikka masala", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Indisk", prepTimeMinutes: 35 },
  { id: -36, name: "Vegetar lasagne", isFishMeal: false, isVegetarian: true, isVegan: false, cuisine: "Italiensk", prepTimeMinutes: 55 },
  { id: -37, name: "Quinoasalat med avokado", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Internasjonal", prepTimeMinutes: 20 },
  { id: -38, name: "Pannekaker med syltetøy", isFishMeal: false, isVegetarian: true, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 25 },
  { id: -39, name: "Grønn Thai-karri med grønnsaker", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Thai", prepTimeMinutes: 30 },
  { id: -40, name: "Pasta carbonara med egg", isFishMeal: false, isVegetarian: true, isVegan: false, cuisine: "Italiensk", prepTimeMinutes: 20 },
];
