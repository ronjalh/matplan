export function validateQrInput(
  name: string,
  url: string,
): { ok: true } | { ok: false; error: string } {
  if (!name.trim()) return { ok: false, error: "QR-koden trenger et navn" };
  if (!url.trim()) return { ok: false, error: "URL mangler" };

  try {
    new URL(url);
  } catch {
    return { ok: false, error: "Ugyldig URL" };
  }

  return { ok: true };
}
