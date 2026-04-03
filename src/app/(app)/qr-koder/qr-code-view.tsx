"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { createQrCode, deleteQrCode } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Download, ExternalLink, Loader2 } from "lucide-react";

interface QrCodeItem {
  id: number;
  name: string;
  url: string;
  createdAt: string;
}

export function QrCodeView({ codes }: { codes: QrCodeItem[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    setError(null);
    const result = await createQrCode(name, url);
    setCreating(false);
    if (result.success) {
      setName("");
      setUrl("");
    } else {
      setError(result.error ?? "Noe gikk galt");
    }
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Navn (f.eks. Min nettside)"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button onClick={handleCreate} disabled={creating || !name.trim() || !url.trim()} className="gap-2">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Opprett QR-kode
          </Button>
        </CardContent>
      </Card>

      {/* Saved QR codes */}
      {codes.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Ingen QR-koder ennå. Opprett en ovenfor.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {codes.map((code) => (
            <QrCard key={code.id} code={code} />
          ))}
        </div>
      )}
    </div>
  );
}

function QrCard({ code }: { code: QrCodeItem }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, code.url, {
        width: 200,
        margin: 2,
        color: { dark: "#2D3436", light: "#FFFFFF" },
      });
    }
  }, [code.url]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${code.name.replace(/[^a-zA-Z0-9æøåÆØÅ -]/g, "")}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  async function handleDelete() {
    if (!confirm(`Slette "${code.name}"?`)) return;
    setDeleting(true);
    await deleteQrCode(code.id);
    setDeleting(false);
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4 space-y-3">
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="rounded-md" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm truncate">{code.name}</h3>
          <a
            href={code.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary truncate block flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">{code.url}</span>
          </a>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1 flex-1">
            <Download className="w-3.5 h-3.5" /> Last ned
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
