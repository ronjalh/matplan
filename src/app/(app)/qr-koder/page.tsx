import Link from "next/link";
import { getQrCodes } from "./actions";
import { QrCodeView } from "./qr-code-view";

export default async function QrKoderPage() {
  const codes = await getQrCodes();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
          QR-koder
        </h1>
        <Link
          href="/strekkoder"
          className="text-sm px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          Strekkoder →
        </Link>
      </div>
      <QrCodeView
        codes={codes.map((c) => ({
          id: c.id,
          name: c.name,
          url: c.url,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
