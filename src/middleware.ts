export { auth as middleware } from "@/lib/auth/auth-config";

export const config = {
  matcher: [
    // Protect all routes except login, shared links, auth API, static assets,
    // and the public QR/barcode generators
    "/((?!login|shared|api/auth|api/shared|qr-koder|strekkoder|_next|favicon|.*\\.png$|.*\\.ico$).*)",
  ],
};
