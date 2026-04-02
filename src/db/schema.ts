import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ============================================================================
// Auth (NextAuth.js + Google OAuth)
// ============================================================================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ============================================================================
// Households — all shared data keyed by householdId, not userId
// ============================================================================

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const householdMembers = pgTable(
  "household_members",
  {
    householdId: integer("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<"owner" | "member">().notNull().default("owner"),
    joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
  },
  (hm) => [unique().on(hm.householdId, hm.userId)]
);

export const userSettings = pgTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  priceProvider: text("price_provider")
    .$type<"kassalapp" | "oda">()
    .notNull()
    .default("kassalapp"),
  dietaryPreference: text("dietary_preference")
    .$type<"all" | "vegetarian" | "vegan" | "pescetarian">()
    .notNull()
    .default("all"),
  locale: text("locale").$type<"nb" | "en">().notNull().default("nb"),
  theme: text("theme").$type<"light" | "dark" | "system">().notNull().default("system"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
});

// ============================================================================
// Ingredients (global reference data)
// ============================================================================

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEN: text("name_en"),
  category: text("category")
    .$type<
      | "groennsaker"
      | "frukt"
      | "baer"
      | "fullkorn"
      | "poteter"
      | "ris_pasta"
      | "broed"
      | "fisk"
      | "kjoett"
      | "egg"
      | "belgfrukter"
      | "meieri"
      | "fett_olje"
      | "krydder"
      | "annet"
    >()
    .notNull(),
  seasonMonths: jsonb("season_months").$type<number[]>(),
  servingsPerHundredGrams: real("servings_per_hundred_grams"),
  plateModelCategory: text("plate_model_category")
    .$type<"vegetable" | "carbohydrate" | "protein" | "other">()
    .notNull(),
});

// ============================================================================
// Recipes (per household)
// ============================================================================

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  servings: integer("servings").notNull().default(4),
  prepTimeMinutes: integer("prep_time_minutes"),
  instructions: text("instructions"),
  plateModelScore: jsonb("plate_model_score").$type<{
    vegetable: number;
    carbohydrate: number;
    protein: number;
  }>(),
  eightADayServings: real("eight_a_day_servings"),
  isFishMeal: boolean("is_fish_meal").notNull().default(false),
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  isVegan: boolean("is_vegan").notNull().default(false),
  isGlutenFree: boolean("is_gluten_free").notNull().default(false),
  isDairyFree: boolean("is_dairy_free").notNull().default(false),
  isNutFree: boolean("is_nut_free").notNull().default(false),
  cuisine: text("cuisine"),
  source: text("source")
    .$type<"manual" | "spoonacular" | "url-import">()
    .notNull()
    .default("manual"),
  sourceUrl: text("source_url"),
  sourceId: text("source_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  ingredientId: integer("ingredient_id").references(() => ingredients.id),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  originalText: text("original_text"),
});

// ============================================================================
// Store Products (global price cache)
// ============================================================================

export const storeProducts = pgTable(
  "store_products",
  {
    id: serial("id").primaryKey(),
    provider: text("provider").$type<"kassalapp" | "oda">().notNull(),
    providerId: text("provider_id").notNull(),
    name: text("name").notNull(),
    brand: text("brand"),
    store: text("store"),
    priceOre: integer("price_ore").notNull(),
    pricePerUnitOre: integer("price_per_unit_ore"),
    unit: text("unit"),
    weight: text("weight"),
    imageUrl: text("image_url"),
    category: text("category"),
    ingredientId: integer("ingredient_id").references(() => ingredients.id),
    priceHistory: jsonb("price_history").$type<
      { date: string; priceOre: number }[]
    >(),
    lastUpdatedAt: timestamp("last_updated_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (sp) => [unique().on(sp.provider, sp.providerId)]
);

// ============================================================================
// Ingredient-Product Links (user-learned matching)
// ============================================================================

export const ingredientProductLinks = pgTable("ingredient_product_links", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ingredientNameEN: text("ingredient_name_en").notNull(),
  ingredientNameNO: text("ingredient_name_no").notNull(),
  storeProductId: integer("store_product_id").references(
    () => storeProducts.id
  ),
  provider: text("provider").$type<"kassalapp" | "oda">().notNull(),
  lastUsed: timestamp("last_used", { mode: "date" }).defaultNow().notNull(),
});

// ============================================================================
// Meal Planning (per household)
// ============================================================================

export const mealPlan = pgTable("meal_plan", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // ISO date string yyyy-mm-dd
  mealType: text("meal_type")
    .$type<"frokost" | "lunsj" | "middag" | "kveldsmat">()
    .notNull(),
  recipeId: integer("recipe_id").references(() => recipes.id),
  servingsOverride: integer("servings_override"),
  freeText: text("free_text"),
});

// ============================================================================
// Calendar Events (per household)
// ============================================================================

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type")
    .$type<"aktivitet" | "avtale" | "paamminnelse" | "hendelse">()
    .notNull(),
  color: text("color"),
  recurrenceRule: text("recurrence_rule"),
});

// ============================================================================
// Budget (per household)
// ============================================================================

export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  monthlyLimitOre: integer("monthly_limit_ore").notNull(),
  color: text("color"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const budgetEntries = pgTable("budget_entries", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => budgetCategories.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  description: text("description"),
  amountOre: integer("amount_ore").notNull(),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurrenceRule: text("recurrence_rule"),
});

// ============================================================================
// Shopping Lists (per household)
// ============================================================================

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  weekStartDate: text("week_start_date").notNull(),
  generatedFromMealPlan: boolean("generated_from_meal_plan")
    .notNull()
    .default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const shoppingListItems = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  shoppingListId: integer("shopping_list_id")
    .notNull()
    .references(() => shoppingLists.id, { onDelete: "cascade" }),
  ingredientId: integer("ingredient_id").references(() => ingredients.id),
  storeProductId: integer("store_product_id").references(
    () => storeProducts.id
  ),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  estimatedPriceOre: integer("estimated_price_ore"),
  priceSource: text("price_source"), // "Helmelk 1l Tine — Joker" or "Egendefinert"
  checked: boolean("checked").notNull().default(false),
  category: text("category"),
});

// ============================================================================
// Shared Links (MVP sharing)
// ============================================================================

export const sharedLinks = pgTable("shared_links", {
  id: serial("id").primaryKey(),
  token: text("token").unique().notNull(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  resourceType: text("resource_type")
    .$type<"shoppingList">()
    .notNull(),
  resourceId: integer("resource_id").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
