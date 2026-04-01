# Matplan — Claude Development Guide

## Project Overview
Norwegian meal planning and budgeting web app. Cloud-hosted, multi-user (~10), free tier ($0).
Users plan meals, compare grocery prices, track nutrition, and manage budgets.

## Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **UI:** shadcn/ui + Tailwind CSS v4
- **Database:** PostgreSQL via Drizzle ORM (Neon serverless, Frankfurt)
- **Auth:** NextAuth.js v5 + Google OAuth (no passwords)
- **Recipes:** Spoonacular API (685k+) + URL import (schema.org)
- **Prices:** Kassalapp API + Oda internal API (dual provider, user chooses)
- **i18n:** next-intl (nb/en) — not yet implemented
- **Theme:** next-themes (light/dark/system)
- **Hosting:** Vercel Hobby ($0)

## Architecture
- **Route groups:** `(app)/` for authenticated pages, root for login
- **Server Components** by default. `'use client'` only for interactivity.
- **Server Actions** for mutations. No REST API layer.
- **`householdId`** on all shared data (recipes, meal plans, budgets, calendars, shopping lists). Personal settings on `userId`.
- **`lib/`** = pure business logic, no framework imports
- **`price-api/`** = dual provider with shared interface
- **`recipe-api/`** = Spoonacular + URL import

## Key Conventions
- All amounts in **integer øre** (4990 = kr 49,90). Display with `Intl.NumberFormat('nb-NO')`.
- Dates stored as ISO strings `yyyy-mm-dd`. Week starts **Monday**.
- Norwegian URL slugs: `/kalender`, `/oppskrifter`, `/budsjett`, `/handleliste`, `/sesong`
- Ingredient names: Norwegian (`name`) + English (`nameEN`) for Spoonacular matching

## Constraints
- NEVER hardcode text — use i18n `t()` when implemented
- NEVER put business logic in components — use `lib/`
- NEVER use `userId` for shared data — always `householdId`
- NEVER commit `.env.local` or `.env` — secrets only in Vercel env vars
- NEVER exceed Spoonacular 150 req/day — cache aggressively
- NEVER exceed Kassalapp 60 req/min
- Vercel serverless functions timeout at 10 seconds

## Database
Schema: `src/db/schema.ts` (16 tables, Drizzle ORM)
Push changes: `npx drizzle-kit push`
Connection: `@neondatabase/serverless` HTTP driver

## Test Strategy
- `npm test` — Vitest (unit + integration)
- `npm run test:e2e` — Playwright
- Coverage targets: 95% nutrition, 90% budget, 70% APIs

## Skills
34 domain skills in `.claude/skills/`. Key ones:
- `app-architecture` — patterns and data flow
- `design-system` — colors, typography, spacing
- `norsk-ernaering` — plate model, 8-a-day, fish
- `prisdata-api` — Kassalapp + Oda dual provider
- `husstand-deling` — householdId architecture
- `qa-matplan` — quality gate checklist

## Current State
Fase 1 in progress. Working: auth, database, sidebar layout, dashboard.
Next: onboarding, i18n, Vercel deploy.

## Learning Log
See LEARNINGS.md for codebase-specific discoveries and gotchas.
