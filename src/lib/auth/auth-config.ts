import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  households,
  householdMembers,
  userSettings,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  events: {
    // Auto-create household on first sign-in
    async createUser({ user }) {
      if (!user.id) return;

      // Create household
      const [household] = await db
        .insert(households)
        .values({
          name: `${user.name ?? "Min"}s husstand`,
        })
        .returning();

      // Add user as owner
      await db.insert(householdMembers).values({
        householdId: household.id,
        userId: user.id,
        role: "owner",
      });

      // Create default settings
      await db.insert(userSettings).values({
        userId: user.id,
      });
    },
  },
  callbacks: {
    authorized({ auth: sessionData, request }) {
      const isLoggedIn = !!sessionData?.user;
      const isOnLoginPage = request.nextUrl.pathname === "/login";
      if (isOnLoginPage) return true; // Always allow login page
      return isLoggedIn; // Redirect to login if not authenticated
    },
    async session({ session, user }) {
      // Add householdId to session for easy access
      if (user?.id) {
        const membership = await db.query.householdMembers.findFirst({
          where: eq(householdMembers.userId, user.id),
        });
        if (membership) {
          (session as any).householdId = membership.householdId;
        }
      }
      return session;
    },
  },
});
