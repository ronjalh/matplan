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
  const plainRef = useRef<HTMLCanvasElement>(null);
  const pandaRef = useRef<HTMLCanvasElement>(null);
  const [variant, setVariant] = useState<"vanlig" | "panda">("vanlig");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Render plain QR
    if (plainRef.current) {
      QRCode.toCanvas(plainRef.current, code.url, {
        width: 200,
        margin: 2,
        color: { dark: "#2D3436", light: "#FFFFFF" },
      });
    }
    // Render panda QR
    if (pandaRef.current) {
      QRCode.toCanvas(pandaRef.current, code.url, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#2D3436", light: "#FFFFFF" },
      }, () => {
        const canvas = pandaRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const size = Math.floor(canvas.width * 0.22);
        const x = Math.floor((canvas.width - size) / 2);
        const y = Math.floor((canvas.height - size) / 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
        ctx.fill();
        drawPixelPanda(ctx, x, y, size);
      });
    }
  }, [code.url]);

  function handleDownload() {
    const canvas = variant === "panda" ? pandaRef.current : plainRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    const suffix = variant === "panda" ? "-panda" : "";
    link.download = `${code.name.replace(/[^a-zA-Z0-9æøåÆØÅ -]/g, "")}${suffix}.png`;
    link.href = canvas.toDataURL("image/png");
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
        {/* Variant tabs */}
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => setVariant("vanlig")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              variant === "vanlig" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Vanlig
          </button>
          <button
            onClick={() => setVariant("panda")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              variant === "panda" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Panda
          </button>
        </div>
        <div className="flex justify-center">
          <canvas ref={plainRef} className={`rounded-md ${variant === "vanlig" ? "" : "hidden"}`} />
          <canvas ref={pandaRef} className={`rounded-md ${variant === "panda" ? "" : "hidden"}`} />
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

/**
 * Draw a tiny pixel-art panda face on a canvas context.
 * 10x10 grid scaled to fit `size` pixels at position (x, y).
 */
function drawPixelPanda(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const grid = 10;
  const px = size / grid;
  // _ = transparent, B = black, W = white, P = pink
  const rows = [
    "_BB____BB_",
    "BBBB__BBBB",
    "_BWWBBWWB_",
    "_WWWWWWWW_",
    "_WBBWWBBW_",
    "_WWWWWWWW_",
    "__WWBBWW__",
    "__WPWWPW__",
    "___WWWW___",
    "____WW____",
  ];
  const colors: Record<string, string> = { B: "#3D3028", W: "#FFF9F5", P: "#FFB5C5" };
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === "_") continue;
      ctx.fillStyle = colors[ch];
      ctx.fillRect(x + c * px, y + r * px, Math.ceil(px), Math.ceil(px));
    }
  }
}
