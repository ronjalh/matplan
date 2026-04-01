# LEARNINGS.md

## 2026-04-01

- **Issue:** `asChild` prop warning from Radix/shadcn components in React 19. "React does not recognize the `asChild` prop on a DOM element." 
  **Status:** Known compatibility issue between Radix UI and React 19. Not a bug, just a warning. Will be fixed upstream.
  **Priority:** Low — cosmetic warning, does not affect functionality.

- **Issue:** Theme toggle (sun/moon) in sidebar footer is not visible/accessible to user.
  **Status:** Needs investigation — may be hidden by sidebar collapse state or CSS.
  **Priority:** Medium — dark mode toggle needs to be easily discoverable. Consider moving to header bar instead.

- **Discovery:** Neon connection string with `channel_binding=require` can cause issues. Removed it and connection works fine with just `sslmode=require`.

- **Discovery:** NextAuth DrizzleAdapter needs explicit table references when table names don't match defaults. Fixed by passing `{ usersTable, accountsTable, sessionsTable, verificationTokensTable }`.

- **Discovery:** Server Action `signIn()` from `@/lib/auth/auth-config` didn't redirect properly. Switching to client-side `signIn()` from `next-auth/react` fixed Google OAuth flow.
