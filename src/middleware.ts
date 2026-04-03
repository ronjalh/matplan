export { auth as middleware } from "@/lib/auth/auth-config";

export const config = {
  matcher: [
    // Protect all routes except login, shared links, auth API, static assets
    "/((?!login|shared|api/auth|api/shared|_next|favicon|.*\\.png$|.*\\.ico$).*)",
  ],
};
