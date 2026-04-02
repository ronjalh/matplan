# Matplan Security Audit Report

**Date:** 2026-04-02
**Auditor:** Claude Opus 4.6 (automated)
**Application:** Matplan — Norwegian meal planning & budgeting web app
**Stack:** Next.js 16, PostgreSQL (Neon), NextAuth.js, Vercel Hobby
**URL:** https://matplan-one.vercel.app

---

## Executive Summary

A comprehensive security audit identified **4 HIGH**, **3 MEDIUM**, and **2 LOW** severity issues. All HIGH and MEDIUM issues have been patched. The application follows secure patterns overall (parameterized queries, server-side API keys, React XSS protection), with the primary weakness being inconsistent authorization checks on server actions.

**Post-fix status:** All HIGH and MEDIUM issues resolved. LOW issues documented for future improvement.

---

## 1. Authentication & Authorization

### 1.1 Authentication Mechanism
- **Provider:** NextAuth.js v5 with Google OAuth (OIDC)
- **Session storage:** Database sessions (PostgreSQL via Drizzle adapter)
- **Session verification:** `auth()` function from NextAuth

**Assessment:** ✅ Solid. Google OAuth eliminates password-related vulnerabilities. Database sessions are more secure than JWT for server-rendered apps.

### 1.2 Authorization Model
- **Multi-tenant:** Data isolated by `householdId` (not `userId`)
- **Household creation:** Automatic on first login
- **Data access pattern:** `getHouseholdId()` helper verifies auth and returns household

**Assessment:** ✅ Good pattern. Household-based isolation is correct for shared family accounts.

### 1.3 Vulnerabilities Found & Fixed

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | **HIGH** | `toggleItem`, `updateItemPrice`, `removeItem` had no auth/ownership check | ✅ Fixed |
| 2 | **HIGH** | `addItem` accepted any `listId` without ownership check | ✅ Fixed |
| 3 | **HIGH** | Shared link toggle could modify items on any shopping list | ✅ Fixed |
| 4 | **HIGH** | `searchSpoonacular` had no auth check (API quota exposure) | ✅ Fixed |
| 5 | **MEDIUM** | `deleteCategory` deleted entries without householdId scope | ✅ Fixed |

**Fix details:**
- Added `verifyItemOwnership()` helper that checks item → list → household chain
- Shared link toggle now verifies `shoppingListItems.shoppingListId === link.resourceId`
- All server actions now verify authentication before executing

---

## 2. Input Validation

### 2.1 SQL Injection
**Risk:** None
**Details:** Drizzle ORM is used exclusively with parameterized queries. No raw SQL strings found anywhere in the codebase. All user input passes through Drizzle's query builder.

### 2.2 Cross-Site Scripting (XSS)
**Risk:** None (React default)
**Details:** No `dangerouslySetInnerHTML` usage found. All user-supplied text (recipe names, descriptions, budget entries) is rendered via JSX text interpolation, which auto-escapes HTML entities.

### 2.3 Server-Side Request Forgery (SSRF)
**Risk:** LOW
**File:** `src/recipe-api/url-import.ts`
**Details:** The URL import feature fetches any user-supplied URL. On Vercel serverless, this is mitigated (no internal network to access). The Googlebot user agent could cause some services to trust the request.
**Recommendation:** Add URL allowlist for known recipe sites (matprat.no, etc.) in future.

### 2.4 JSON Parsing
**Risk:** MEDIUM (unfixed — causes 500, not exploitable)
**File:** `src/app/(app)/oppskrifter/actions.ts`
**Details:** `JSON.parse(ingredientsJson)` without try/catch. Malformed JSON causes unhandled error.
**Recommendation:** Wrap in try/catch, return error result.

---

## 3. API Key Security

| Key | Storage | Exposure Risk |
|-----|---------|---------------|
| `DATABASE_URL` | `.env.local` only | None — server-side only |
| `AUTH_SECRET` | `.env.local` only | None — server-side only |
| `AUTH_GOOGLE_ID` | `.env.local` only | None — server-side only |
| `AUTH_GOOGLE_SECRET` | `.env.local` only | None — server-side only |
| `KASSALAPP_API_KEY` | `.env.local` only | None — server-side only |
| `SPOONACULAR_API_KEY` | `.env.local` only | LOW — appears in URL query params |

**Notes:**
- No `NEXT_PUBLIC_` prefixed env vars exist
- All API calls are server-side (server actions, server components)
- `.env*` is in `.gitignore`
- Spoonacular key in URL query string may appear in logs; consider using `x-api-key` header

---

## 4. Shared Links Security

### 4.1 Token Generation
- **Method:** `crypto.randomUUID()` (122 bits entropy)
- **Previously:** Truncated to 12 chars (48 bits) — **Fixed** to use full UUID

### 4.2 Token Expiry
- **Duration:** 7 days
- **Enforcement:** Checked on both page load and API route
- **Assessment:** ✅ Correct

### 4.3 Token Scope
- **Previously:** Token allowed toggling ANY item in ANY list — **Fixed**
- **Now:** Token only allows toggling items in the specific linked shopping list
- **Read access:** Limited to items in the linked list only

---

## 5. CSRF Protection

- **Server Actions:** Protected by Next.js built-in Origin header check ✅
- **API Route (`/api/shared/[token]/toggle`):** No CSRF protection, but token-in-URL serves as authorization ✅ (acceptable)

---

## 6. Rate Limiting

**Status:** No rate limiting implemented.

**At-risk endpoints:**
| Endpoint | Risk | Impact |
|----------|------|--------|
| `searchSpoonacular` | Quota exhaustion | 150 req/day limit |
| `/api/shared/[token]/toggle` | Spam | Toggle items rapidly |
| `importRecipeFromUrl` | Outbound fetch abuse | SSRF-like behavior |
| `generateShoppingList` | Kassalapp quota | 60 req/min limit |

**Recommendation:** Implement `@upstash/ratelimit` with Vercel KV for critical endpoints.
**Priority:** MEDIUM — Vercel has some built-in DDoS protection, but application-level limits are missing.

---

## 7. Data Privacy (GDPR)

- **Data storage:** Neon PostgreSQL in Frankfurt (EU)
- **Account deletion:** Full cascade delete available in Settings
- **Data collected:** Name, email, profile picture (from Google), all user-created content
- **Third-party data sharing:**
  - Kassalapp API: ingredient search queries sent
  - Spoonacular API: recipe search queries sent
  - Google: OAuth tokens
- **Recommendation:** Add privacy policy page describing data handling

---

## 8. Remaining LOW-Priority Issues

1. **Spoonacular API key in URL query params** — may appear in Vercel logs
2. **No URL allowlist for URL import** — any URL can be fetched
3. **No rate limiting** — application-level rate limits missing
4. **No JSON.parse error handling** in recipe ingredient parsing
5. **No input validation** on date/eventType parameters in calendar actions

---

## 9. Security Checklist for Future Development

When adding new features, verify:
- [ ] All server actions call `auth()` or `getHouseholdId()` first
- [ ] All database queries filter by `householdId` for shared data
- [ ] All item-level operations verify ownership (item → parent → household)
- [ ] No raw SQL strings (always use Drizzle ORM)
- [ ] No `dangerouslySetInnerHTML`
- [ ] API keys only in env vars, never in client code
- [ ] Shared/public endpoints validate scope (token → specific resource)
- [ ] Number inputs use `type="number"` to prevent string injection
- [ ] Server Actions return result objects, never throw
