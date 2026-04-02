"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importFromUrl } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Loader2, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function UrlImportForm() {
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: number; name: string } | null>(null);
  const router = useRouter();

  async function handleImport() {
    if (!url.trim() || pending) return;
    setPending(true);
    setError(null);
    setSuccess(null);

    const result = await importFromUrl(url.trim());
    if (!result.success) {
      setError(result.error ?? "Noe gikk galt");
    } else {
      setSuccess({ id: result.id!, name: result.recipe!.name });
    }
    setPending(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Lim inn URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.matprat.no/oppskrifter/..."
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
              className="flex-1"
            />
            <Button onClick={handleImport} disabled={pending} className="gap-2">
              {pending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Henter...</>
              ) : (
                "Importer"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Fungerer med matprat.no. Støtte for flere sider kommer.
          </p>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}

      {success && (
        <Card className="border-primary">
          <CardContent className="py-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{success.name}</p>
              <p className="text-sm text-muted-foreground">Importert og lagret!</p>
            </div>
            <Button size="sm" onClick={() => router.push(`/oppskrifter/${success.id}`)}>
              Vis oppskrift
            </Button>
          </CardContent>
        </Card>
      )}

      <Link href="/oppskrifter" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Tilbake til oppskrifter
      </Link>
    </div>
  );
}
