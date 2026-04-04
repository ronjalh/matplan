import Link from "next/link";
import { DataMatrixView } from "./data-matrix-view";

export default function StrekkoderPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
          Strekkoder
        </h1>
        <Link
          href="/qr-koder"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← QR-koder
        </Link>
      </div>
      <DataMatrixView />
    </div>
  );
}
