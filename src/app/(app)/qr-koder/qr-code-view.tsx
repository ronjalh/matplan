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

type QrVariant = "vanlig" | "panda" | "katt" | "propulse" | "eget";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 1024 * 1024; // 1 MB

function renderLogoQr(
  canvas: HTMLCanvasElement,
  url: string,
  drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void,
  darkColor = "#2D3436"
) {
  QRCode.toCanvas(canvas, url, {
    width: 200,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: darkColor, light: "#FFFFFF" },
  }, () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = Math.floor(canvas.width * 0.24);
    const x = Math.floor((canvas.width - size) / 2);
    const y = Math.floor((canvas.height - size) / 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
    ctx.fill();
    drawFn(ctx, x, y, size);
  });
}

function renderImageQr(canvas: HTMLCanvasElement, url: string, imageSrc: string, darkColor = "#2D3436") {
  QRCode.toCanvas(canvas, url, {
    width: 200,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: darkColor, light: "#FFFFFF" },
  }, () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      const logoSize = Math.floor(canvas.width * 0.26);
      const x = Math.floor((canvas.width - logoSize) / 2);
      const y = Math.floor((canvas.height - logoSize) / 2);
      // White background with rounded rect
      ctx.fillStyle = "#FFFFFF";
      const pad = 4;
      ctx.beginPath();
      ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 6);
      ctx.fill();
      // Draw logo
      ctx.drawImage(img, x, y, logoSize, logoSize);
    };
    img.src = imageSrc;
  });
}

function QrCard({ code }: { code: QrCodeItem }) {
  const plainRef = useRef<HTMLCanvasElement>(null);
  const pandaRef = useRef<HTMLCanvasElement>(null);
  const catRef = useRef<HTMLCanvasElement>(null);
  const propulseRef = useRef<HTMLCanvasElement>(null);
  const customRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [variant, setVariant] = useState<QrVariant>("vanlig");
  const [deleting, setDeleting] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [qrColor, setQrColor] = useState("#2D3436");

  useEffect(() => {
    if (plainRef.current) {
      QRCode.toCanvas(plainRef.current, code.url, {
        width: 200, margin: 2, color: { dark: qrColor, light: "#FFFFFF" },
      });
    }
    if (pandaRef.current) renderLogoQr(pandaRef.current, code.url, drawPixelPanda, qrColor);
    if (catRef.current) renderLogoQr(catRef.current, code.url, drawPixelCat, qrColor);
    if (propulseRef.current) renderImageQr(propulseRef.current, code.url, "/propulse_til_qr.png", qrColor);
  }, [code.url, qrColor]);

  useEffect(() => {
    if (customImage && customRef.current) {
      renderImageQr(customRef.current, code.url, customImage, qrColor);
    }
  }, [customImage, code.url, qrColor]);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Kun PNG, JPG, GIF og WebP er støttet.");
      return;
    }
    // Validate size
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Bildet er for stort (maks 1 MB).");
      return;
    }

    // Read as data URL — stays in browser, never sent to server
    const reader = new FileReader();
    reader.onload = () => {
      // Verify it actually loads as an image
      const img = new Image();
      img.onload = () => {
        setCustomImage(reader.result as string);
        setVariant("eget");
      };
      img.onerror = () => {
        setImageError("Kunne ikke lese bildet. Prøv et annet.");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleDownload() {
    const refs: Record<QrVariant, React.RefObject<HTMLCanvasElement | null>> = {
      vanlig: plainRef, panda: pandaRef, katt: catRef, propulse: propulseRef, eget: customRef,
    };
    const canvas = refs[variant].current;
    if (!canvas) return;
    const link = document.createElement("a");
    const suffix = variant !== "vanlig" ? `-${variant}` : "";
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

  const variants: { key: QrVariant; label: string }[] = [
    { key: "vanlig", label: "Vanlig" },
    { key: "panda", label: "Panda" },
    { key: "katt", label: "Katt" },
    { key: "propulse", label: "Propulse" },
    { key: "eget", label: "Eget bilde" },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4 space-y-3">
        {/* Variant tabs */}
        <div className="flex flex-wrap gap-1 justify-center">
          {variants.map((v) => (
            <button
              key={v.key}
              onClick={() => {
                if (v.key === "eget" && !customImage) {
                  fileInputRef.current?.click();
                } else {
                  setVariant(v.key);
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                variant === v.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {v.label}
            </button>
          ))}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        {/* Color picker */}
        <div className="flex items-center justify-center gap-1.5">
          {[
            { color: "#2D3436", label: "Svart" },
            { color: "#0984E3", label: "Blå" },
            { color: "#00B894", label: "Grønn" },
            { color: "#E17055", label: "Rød" },
            { color: "#6C5CE7", label: "Lilla" },
            { color: "#E84393", label: "Rosa" },
          ].map((c) => (
            <button
              key={c.color}
              title={c.label}
              onClick={() => setQrColor(c.color)}
              className={`w-5 h-5 rounded-full cursor-pointer transition-all ${
                qrColor === c.color ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110"
              }`}
              style={{ backgroundColor: c.color }}
            />
          ))}
          <label className="relative cursor-pointer">
            <input
              type="color"
              value={qrColor}
              onChange={(e) => setQrColor(e.target.value)}
              className="absolute inset-0 w-5 h-5 opacity-0 cursor-pointer"
            />
            <span
              className={`block w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground transition-all ${
                ![
                  "#2D3436", "#0984E3", "#00B894", "#E17055", "#6C5CE7", "#E84393",
                ].includes(qrColor) ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110"
              }`}
              style={{ background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)` }}
              title="Egendefinert farge"
            />
          </label>
        </div>
        {imageError && (
          <p className="text-xs text-destructive text-center">{imageError}</p>
        )}
        <div className="flex justify-center">
          <canvas ref={plainRef} className={`rounded-md ${variant === "vanlig" ? "" : "hidden"}`} />
          <canvas ref={pandaRef} className={`rounded-md ${variant === "panda" ? "" : "hidden"}`} />
          <canvas ref={catRef} className={`rounded-md ${variant === "katt" ? "" : "hidden"}`} />
          <canvas ref={propulseRef} className={`rounded-md ${variant === "propulse" ? "" : "hidden"}`} />
          <canvas ref={customRef} className={`rounded-md ${variant === "eget" ? "" : "hidden"}`} />
          {variant === "eget" && !customImage && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-[200px] h-[200px] rounded-md border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              Klikk for å velge bilde
            </button>
          )}
        </div>
        {variant === "eget" && customImage && (
          <div className="flex justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-muted-foreground hover:text-primary cursor-pointer"
            >
              Bytt bilde
            </button>
          </div>
        )}
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

/** Draw pixel art from a grid definition */
function drawPixelGrid(
  ctx: CanvasRenderingContext2D, x: number, y: number, size: number,
  rows: string[], colors: Record<string, string>
) {
  const grid = rows.length;
  const px = size / grid;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === "_") continue;
      ctx.fillStyle = colors[ch] ?? "#000";
      ctx.fillRect(x + c * px, y + r * px, Math.ceil(px), Math.ceil(px));
    }
  }
}

/** Pixel-art panda face — 12x12 grid */
function drawPixelPanda(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const rows = [
    "_BB______BB_",
    "BBWB____BWBB",
    "BBBB____BBBB",
    "__BWWWWWWB__",
    "__WWWWWWWW__",
    "__WBWWWWBW__",
    "__WBWWWWBW__",
    "__WWWBBWWW__",
    "__WWPWWPWW__",
    "___WWWWWW___",
    "____WWWW____",
    "____________",
  ];
  drawPixelGrid(ctx, x, y, size, rows, { B: "#3D3028", W: "#FFF9F5", P: "#FFB5C5" });
}

/** Pixel-art cat face — 12x12 grid */
function drawPixelCat(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const rows = [
    "O__________O",
    "OO________OO",
    "OOO______OOO",
    "OOOOOOOOOOOO",
    "OWOOOOOOOWOO",
    "OGWOOOOOGWOO",
    "OOOOOOOOOOOO",
    "OOOOPOOPOOO_",
    "OOOOOBOOOO__",
    "_OOOOOOOO___",
    "__OOOOOO____",
    "____________",
  ];
  drawPixelGrid(ctx, x, y, size, rows, { O: "#F4A460", W: "#FFF9F5", G: "#5A8F5A", P: "#FFB5C5", B: "#3D3028" });
}
