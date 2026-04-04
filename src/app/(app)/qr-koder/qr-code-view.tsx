// TODO: Avansert modus — la brukeren laste opp et bilde som brukes som "fyll" i QR-modulene.
// I stedet for ensfarget farge tegnes modulene som masker som viser deler av det opplastede bildet,
// slik at QR-koden fremstår som et bilde sett gjennom QR-formede vinduer.

"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { createQrCode, deleteQrCode } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Download, ExternalLink, Loader2, AlertTriangle, Settings2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────

interface QrCodeItem {
  id: number;
  name: string;
  url: string;
  createdAt: string;
}

type QrVariant = "vanlig" | "panda" | "katt" | "propulse" | "eget";
type PixelStyle = "firkant" | "avrundet" | "prikk";
type LogoType = "ingen" | "panda" | "katt" | "propulse" | "eget";
type LogoShape = "firkant" | "sirkel";

// ─── Constants ───────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ADV_CANVAS = 400;

const COLOR_PRESETS = [
  { color: "#2D3436", label: "Svart" },
  { color: "#0984E3", label: "Blå" },
  { color: "#00B894", label: "Grønn" },
  { color: "#E17055", label: "Rød" },
  { color: "#6C5CE7", label: "Lilla" },
  { color: "#E84393", label: "Rosa" },
];

// ─── Utilities ───────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

function hexToLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function validateAndReadFile(
  file: File,
  onSuccess: (img: HTMLImageElement) => void,
  onError: (msg: string) => void,
) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    onError("Kun PNG, JPG, GIF og WebP er støttet.");
    return;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    onError("Bildet er for stort (maks 2 MB).");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => onSuccess(img);
    img.onerror = () => onError("Kunne ikke lese bildet. Prøv et annet.");
    img.src = reader.result as string;
  };
  reader.readAsDataURL(file);
}

// ─── Simple mode rendering (QRCode.toCanvas) ────────

function renderLogoQr(
  canvas: HTMLCanvasElement,
  url: string,
  drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, transparent: boolean) => void,
  darkColor = "#2D3436",
  lightColor = "#FFFFFF",
) {
  const transparent = lightColor !== "#FFFFFF";
  QRCode.toCanvas(canvas, url, {
    width: 200, margin: 2, errorCorrectionLevel: "H",
    color: { dark: darkColor, light: lightColor },
  }, () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = Math.floor(canvas.width * 0.24);
    const x = Math.floor((canvas.width - size) / 2);
    const y = Math.floor((canvas.height - size) / 2);
    if (transparent) {
      ctx.clearRect(x - 3, y - 3, size + 6, size + 6);
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
      ctx.fill();
    }
    drawFn(ctx, x, y, size, transparent);
  });
}

function renderImageQr(
  canvas: HTMLCanvasElement, url: string, imageSrc: string,
  darkColor = "#2D3436", lightColor = "#FFFFFF",
) {
  QRCode.toCanvas(canvas, url, {
    width: 200, margin: 2, errorCorrectionLevel: "H",
    color: { dark: darkColor, light: lightColor },
  }, () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      const logoSize = Math.floor(canvas.width * 0.26);
      const x = Math.floor((canvas.width - logoSize) / 2);
      const y = Math.floor((canvas.height - logoSize) / 2);
      const pad = 4;
      if (lightColor === "#FFFFFF") {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 6);
        ctx.fill();
      } else {
        ctx.clearRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2);
      }
      ctx.drawImage(img, x, y, logoSize, logoSize);
    };
    img.src = imageSrc;
  });
}

// ─── Advanced mode rendering (QRCode.create) ────────

function isFinderZone(row: number, col: number, size: number): boolean {
  if (row < 7 && col < 7) return true;
  if (row < 7 && col >= size - 7) return true;
  if (row >= size - 7 && col < 7) return true;
  return false;
}

function drawModuleAdv(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  style: PixelStyle,
) {
  const gap = style === "firkant" ? 0 : size * 0.15;
  switch (style) {
    case "firkant":
      ctx.fillRect(x, y, size, size);
      break;
    case "avrundet": {
      const r = size * 0.35;
      ctx.beginPath();
      ctx.roundRect(x + gap / 2, y + gap / 2, size - gap, size - gap, r);
      ctx.fill();
      break;
    }
    case "prikk": {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, (size - gap) / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

function drawFinderPatternAdv(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  style: PixelStyle, darkColor: string, lightColor: string | null,
) {
  const ms = size / 7;

  // Draw finder pattern to an offscreen canvas first, then composite
  const offscreen = document.createElement("canvas");
  offscreen.width = Math.ceil(size) + 2;
  offscreen.height = Math.ceil(size) + 2;
  const oc = offscreen.getContext("2d")!;

  if (style === "prikk") {
    const cx = size / 2 + 1;
    const cy = size / 2 + 1;

    // Outer ring
    oc.fillStyle = darkColor;
    oc.beginPath();
    oc.arc(cx, cy, size / 2, 0, Math.PI * 2);
    oc.fill();

    // Middle gap (cut hole for transparent, fill white otherwise)
    if (lightColor) {
      oc.fillStyle = lightColor;
    } else {
      oc.globalCompositeOperation = "destination-out";
      oc.fillStyle = "#000";
    }
    oc.beginPath();
    oc.arc(cx, cy, size / 2 - ms, 0, Math.PI * 2);
    oc.fill();
    oc.globalCompositeOperation = "source-over";

    // Inner dot
    oc.fillStyle = darkColor;
    oc.beginPath();
    oc.arc(cx, cy, size / 2 - ms * 2, 0, Math.PI * 2);
    oc.fill();
  } else {
    const r1 = style === "avrundet" ? ms * 1.2 : 0;
    const r2 = style === "avrundet" ? ms * 0.8 : 0;
    const r3 = style === "avrundet" ? ms * 0.5 : 0;

    // Outer
    oc.fillStyle = darkColor;
    oc.beginPath();
    oc.roundRect(1, 1, size, size, r1);
    oc.fill();

    // Middle gap
    if (lightColor) {
      oc.fillStyle = lightColor;
    } else {
      oc.globalCompositeOperation = "destination-out";
      oc.fillStyle = "#000";
    }
    oc.beginPath();
    oc.roundRect(1 + ms, 1 + ms, size - 2 * ms, size - 2 * ms, r2);
    oc.fill();
    oc.globalCompositeOperation = "source-over";

    // Inner
    oc.fillStyle = darkColor;
    oc.beginPath();
    oc.roundRect(1 + 2 * ms, 1 + 2 * ms, size - 4 * ms, size - 4 * ms, r3);
    oc.fill();
  }

  // Composite the finished finder pattern onto main canvas
  ctx.drawImage(offscreen, x - 1, y - 1);
}

interface AdvRenderOptions {
  pixelStyle: PixelStyle;
  darkColor: string;
  transparentBg: boolean;
  bgImageEl: HTMLImageElement | null;
  overlayImageEl: HTMLImageElement | null;
  overlayOpacity: number;
  logoType: LogoType;
  logoShape: LogoShape;
  customLogoEl: HTMLImageElement | null;
  propulseLogoEl: HTMLImageElement | null;
}

function renderCustomQr(canvas: HTMLCanvasElement, url: string, opts: AdvRenderOptions) {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const mc = qr.modules.size;
  const data = qr.modules.data;

  canvas.width = ADV_CANVAS;
  canvas.height = ADV_CANVAS;
  const ctx = canvas.getContext("2d")!;
  const margin = Math.floor(ADV_CANVAS * 0.05);
  const qrArea = ADV_CANVAS - margin * 2;
  const ms = qrArea / mc;

  // 1. Background
  ctx.clearRect(0, 0, ADV_CANVAS, ADV_CANVAS);
  if (opts.bgImageEl) {
    const img = opts.bgImageEl;
    const scale = Math.max(ADV_CANVAS / img.width, ADV_CANVAS / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (ADV_CANVAS - w) / 2, (ADV_CANVAS - h) / 2, w, h);
  } else if (!opts.transparentBg) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, ADV_CANVAS, ADV_CANVAS);
  }

  // 2. Data modules
  ctx.fillStyle = opts.darkColor;
  for (let r = 0; r < mc; r++) {
    for (let c = 0; c < mc; c++) {
      if (data[r * mc + c] === 0) continue;
      if (isFinderZone(r, c, mc)) continue;
      drawModuleAdv(ctx, margin + c * ms, margin + r * ms, ms, opts.pixelStyle);
    }
  }

  // 3. Finder patterns
  const fpLight = opts.transparentBg && !opts.bgImageEl ? null : "#FFFFFF";
  const fps = 7 * ms;
  drawFinderPatternAdv(ctx, margin, margin, fps, opts.pixelStyle, opts.darkColor, fpLight);
  drawFinderPatternAdv(ctx, margin + (mc - 7) * ms, margin, fps, opts.pixelStyle, opts.darkColor, fpLight);
  drawFinderPatternAdv(ctx, margin, margin + (mc - 7) * ms, fps, opts.pixelStyle, opts.darkColor, fpLight);

  // 4. Logo
  if (opts.logoType !== "ingen") {
    const logoSize = Math.floor(ADV_CANVAS * 0.22);
    const lx = Math.floor((ADV_CANVAS - logoSize) / 2);
    const ly = Math.floor((ADV_CANVAS - logoSize) / 2);
    const pad = 8;
    const circle = opts.logoShape === "sirkel";
    const clear = opts.transparentBg && !opts.bgImageEl;

    // Clear/fill logo area
    if (circle) {
      const r = logoSize / 2 + pad;
      if (!clear) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(lx + logoSize / 2, ly + logoSize / 2, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(lx + logoSize / 2, ly + logoSize / 2, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.clearRect(lx - pad * 2, ly - pad * 2, logoSize + pad * 4, logoSize + pad * 4);
        ctx.restore();
      }
    } else {
      if (!clear) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(lx - pad, ly - pad, logoSize + pad * 2, logoSize + pad * 2, 8);
        ctx.fill();
      } else {
        ctx.clearRect(lx - pad, ly - pad, logoSize + pad * 2, logoSize + pad * 2);
      }
    }

    // Clip for circle shape
    if (circle) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(lx + logoSize / 2, ly + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    if (opts.logoType === "panda") {
      drawPixelPanda(ctx, lx, ly, logoSize, clear);
    } else if (opts.logoType === "katt") {
      drawPixelCat(ctx, lx, ly, logoSize, clear);
    } else if (opts.logoType === "propulse" && opts.propulseLogoEl) {
      ctx.drawImage(opts.propulseLogoEl, lx, ly, logoSize, logoSize);
    } else if (opts.logoType === "eget" && opts.customLogoEl) {
      ctx.drawImage(opts.customLogoEl, lx, ly, logoSize, logoSize);
    }

    if (circle) ctx.restore();
  }

  // 5. Overlay
  if (opts.overlayImageEl && opts.overlayOpacity > 0) {
    const img = opts.overlayImageEl;
    const scale = Math.max(ADV_CANVAS / img.width, ADV_CANVAS / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.globalAlpha = opts.overlayOpacity;
    ctx.drawImage(img, (ADV_CANVAS - w) / 2, (ADV_CANVAS - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }
}

// ─── Pixel Art ───────────────────────────────────────

function drawPixelGrid(
  ctx: CanvasRenderingContext2D, x: number, y: number, size: number,
  rows: string[], colors: Record<string, string>, skipChars: string[] = [],
) {
  const grid = rows.length;
  const px = size / grid;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === "_" || skipChars.includes(ch)) continue;
      ctx.fillStyle = colors[ch] ?? "#000";
      ctx.fillRect(x + c * px, y + r * px, Math.ceil(px), Math.ceil(px));
    }
  }
}

function drawPixelPanda(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, transparent = false) {
  const rows = [
    "_BB______BB_", "BBWB____BWBB", "BBBB____BBBB", "__BWWWWWWB__",
    "__WWWWWWWW__", "__WBWWWWBW__", "__WBWWWWBW__", "__WWWBBWWW__",
    "__WWPWWPWW__", "___WWWWWW___", "____WWWW____", "____________",
  ];
  drawPixelGrid(ctx, x, y, size, rows, { B: "#3D3028", W: "#FFF9F5", P: "#FFB5C5" }, transparent ? ["W"] : []);
}

function drawPixelCat(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, transparent = false) {
  const rows = [
    "O__________O", "OO________OO", "OOO______OOO", "OOOOOOOOOOOO",
    "OWOOOOOOOWOO", "OGWOOOOOGWOO", "OOOOOOOOOOOO", "OOOOPOOPOOO_",
    "OOOOOBOOOO__", "_OOOOOOOO___", "__OOOOOO____", "____________",
  ];
  drawPixelGrid(ctx, x, y, size, rows, { O: "#F4A460", W: "#FFF9F5", G: "#5A8F5A", P: "#FFB5C5", B: "#3D3028" }, transparent ? ["W"] : []);
}

// ─── Components ──────────────────────────────────────

export function QrCodeView({ codes }: { codes: QrCodeItem[] }) {
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
    if (result.success) { setName(""); setUrl(""); }
    else setError(result.error ?? "Noe gikk galt");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Navn (f.eks. Min nettside)" onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
            <Input value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com" onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleCreate} disabled={creating || !name.trim() || !url.trim()} className="gap-2">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Opprett QR-kode
          </Button>
        </CardContent>
      </Card>

      {codes.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Ingen QR-koder ennå. Opprett en ovenfor.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {codes.map((code) => <QrCard key={code.id} code={code} />)}
        </div>
      )}
    </div>
  );
}

// ─── Shared UI helpers ───────────────────────────────

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {COLOR_PRESETS.map((c) => (
        <button key={c.color} title={c.label} onClick={() => onChange(c.color)}
          className={`w-5 h-5 rounded-full cursor-pointer transition-all ${
            value === c.color ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110"
          }`} style={{ backgroundColor: c.color }} />
      ))}
      <label className="relative cursor-pointer">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-5 h-5 opacity-0 cursor-pointer" />
        <span className={`block w-5 h-5 rounded-full transition-all ${
          !COLOR_PRESETS.some((c) => c.color === value) ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110"
        }`} style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }}
          title="Egendefinert farge" />
      </label>
    </div>
  );
}

const tabCls = (active: boolean) =>
  `px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
  }`;

// ─── QR Card ─────────────────────────────────────────

function QrCard({ code }: { code: QrCodeItem }) {
  const [advanced, setAdvanced] = useState(false);
  const [qrColor, setQrColor] = useState("#2D3436");
  const [transparentBg, setTransparentBg] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // ── Simple mode state ──
  const plainRef = useRef<HTMLCanvasElement>(null);
  const pandaRef = useRef<HTMLCanvasElement>(null);
  const catRef = useRef<HTMLCanvasElement>(null);
  const propulseRef = useRef<HTMLCanvasElement>(null);
  const customRef = useRef<HTMLCanvasElement>(null);
  const simpleFileRef = useRef<HTMLInputElement>(null);
  const [variant, setVariant] = useState<QrVariant>("vanlig");
  const [customImage, setCustomImage] = useState<string | null>(null);

  // ── Advanced mode state ──
  const advCanvasRef = useRef<HTMLCanvasElement>(null);
  const advLogoRef = useRef<HTMLInputElement>(null);
  const advBgRef = useRef<HTMLInputElement>(null);
  const advOverlayRef = useRef<HTMLInputElement>(null);
  const [pixelStyle, setPixelStyle] = useState<PixelStyle>("firkant");
  const [logoType, setLogoType] = useState<LogoType>("ingen");
  const [logoShape, setLogoShape] = useState<LogoShape>("firkant");
  const [customLogoEl, setCustomLogoEl] = useState<HTMLImageElement | null>(null);
  const [bgImageEl, setBgImageEl] = useState<HTMLImageElement | null>(null);
  const [overlayImageEl, setOverlayImageEl] = useState<HTMLImageElement | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  const [propulseLogoEl, setPropulseLogoEl] = useState<HTMLImageElement | null>(null);

  // Preload propulse logo for advanced mode
  useEffect(() => {
    loadImage("/propulse_til_qr.png").then(setPropulseLogoEl).catch(() => {});
  }, []);

  // ── Simple mode rendering ──
  const bgColor = transparentBg ? "#00000000" : "#FFFFFF";
  useEffect(() => {
    if (advanced) return;
    if (plainRef.current) {
      QRCode.toCanvas(plainRef.current, code.url, {
        width: 200, margin: 2, color: { dark: qrColor, light: bgColor },
      });
    }
    if (pandaRef.current) renderLogoQr(pandaRef.current, code.url, drawPixelPanda, qrColor, bgColor);
    if (catRef.current) renderLogoQr(catRef.current, code.url, drawPixelCat, qrColor, bgColor);
    if (propulseRef.current) renderImageQr(propulseRef.current, code.url, "/propulse_til_qr.png", qrColor, bgColor);
  }, [advanced, code.url, qrColor, bgColor]);

  useEffect(() => {
    if (advanced) return;
    if (customImage && customRef.current) {
      renderImageQr(customRef.current, code.url, customImage, qrColor, bgColor);
    }
  }, [advanced, customImage, code.url, qrColor, bgColor]);

  // ── Advanced mode rendering ──
  useEffect(() => {
    if (!advanced || !advCanvasRef.current) return;
    renderCustomQr(advCanvasRef.current, code.url, {
      pixelStyle, darkColor: qrColor, transparentBg,
      bgImageEl, overlayImageEl, overlayOpacity,
      logoType, logoShape, customLogoEl, propulseLogoEl,
    });
  }, [
    advanced, code.url, pixelStyle, qrColor, transparentBg,
    bgImageEl, overlayImageEl, overlayOpacity,
    logoType, logoShape, customLogoEl, propulseLogoEl,
  ]);

  // Contrast check (advanced)
  const bgHex = bgImageEl ? null : transparentBg ? null : "#FFFFFF";
  const contrast = bgHex ? getContrastRatio(qrColor, bgHex) : null;
  const lowContrast = contrast !== null && contrast < 3;

  function handleSimpleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndReadFile(file, (img) => {
      setCustomImage(img.src);
      setVariant("eget");
    }, setImageError);
    e.target.value = "";
  }

  function handleAdvUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    onLoad: (el: HTMLImageElement) => void,
  ) {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndReadFile(file, onLoad, setImageError);
    e.target.value = "";
  }

  function handleDownload() {
    let canvas: HTMLCanvasElement | null;
    if (advanced) {
      canvas = advCanvasRef.current;
    } else {
      const refs: Record<QrVariant, React.RefObject<HTMLCanvasElement | null>> = {
        vanlig: plainRef, panda: pandaRef, katt: catRef, propulse: propulseRef, eget: customRef,
      };
      canvas = refs[variant].current;
    }
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${code.name.replace(/[^a-zA-Z0-9æøåÆØÅ -]/g, "")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function handleDelete() {
    if (!confirm(`Slette "${code.name}"?`)) return;
    setDeleting(true);
    await deleteQrCode(code.id);
    setDeleting(false);
  }

  const simpleVariants: { key: QrVariant; label: string }[] = [
    { key: "vanlig", label: "Vanlig" },
    { key: "panda", label: "Panda" },
    { key: "katt", label: "Katt" },
    { key: "propulse", label: "Propulse" },
    { key: "eget", label: "Eget bilde" },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4 space-y-3">
        {/* Mode toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setAdvanced(!advanced)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              advanced ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings2 className="w-3 h-3" />
            {advanced ? "Avansert" : "Avansert"}
          </button>
        </div>

        {advanced ? (
          /* ═══════ ADVANCED MODE ═══════ */
          <>
            {/* Canvas */}
            <div className="flex justify-center">
              <canvas ref={advCanvasRef} className="rounded-md" style={{
                width: 200, height: 200,
                ...(transparentBg && !bgImageEl ? {
                  background: "repeating-conic-gradient(#e0e0e0 0% 25%, #fff 0% 50%) 0 0 / 16px 16px",
                } : {}),
              }} />
            </div>

            {/* Pixel style */}
            <div className="flex items-center justify-center gap-1">
              <span className="text-[10px] text-muted-foreground mr-1">Stil:</span>
              {([["firkant", "■ Firkant"], ["avrundet", "▣ Avrundet"], ["prikk", "● Prikk"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setPixelStyle(key)} className={tabCls(pixelStyle === key)}>{label}</button>
              ))}
            </div>

            {/* Color */}
            <ColorPicker value={qrColor} onChange={setQrColor} />

            {/* Background */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} className="rounded" />
                <span className="text-xs text-muted-foreground">Transparent</span>
              </label>
              <button onClick={() => advBgRef.current?.click()}
                className="text-xs text-muted-foreground hover:text-primary cursor-pointer underline-offset-2 hover:underline">
                {bgImageEl ? "Bytt bakgrunn" : "Bakgrunnsbilde"}
              </button>
              {bgImageEl && (
                <button onClick={() => setBgImageEl(null)} className="text-xs text-destructive cursor-pointer">✕</button>
              )}
              <input ref={advBgRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleAdvUpload(e, setBgImageEl)} />
            </div>

            {/* Logo */}
            <div className="flex flex-wrap gap-1 justify-center">
              {(["ingen", "panda", "katt", "propulse", "eget"] as const).map((t) => (
                <button key={t} onClick={() => {
                  if (t === "eget" && !customLogoEl) advLogoRef.current?.click();
                  else setLogoType(t);
                }} className={tabCls(logoType === t)}>
                  {t === "ingen" ? "Ingen logo" : t === "eget" ? "Eget bilde" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
              <input ref={advLogoRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleAdvUpload(e, (el) => { setCustomLogoEl(el); setLogoType("eget"); })} />
            </div>

            {/* Logo shape */}
            {logoType !== "ingen" && (
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] text-muted-foreground mr-1">Logo-form:</span>
                <button onClick={() => setLogoShape("firkant")} className={tabCls(logoShape === "firkant")}>□ Firkant</button>
                <button onClick={() => setLogoShape("sirkel")} className={tabCls(logoShape === "sirkel")}>○ Sirkel</button>
              </div>
            )}
            {logoType === "eget" && customLogoEl && (
              <div className="flex justify-center">
                <button onClick={() => advLogoRef.current?.click()}
                  className="text-xs text-muted-foreground hover:text-primary cursor-pointer">Bytt logo</button>
              </div>
            )}

            {/* Overlay */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button onClick={() => advOverlayRef.current?.click()}
                className="text-xs text-muted-foreground hover:text-primary cursor-pointer underline-offset-2 hover:underline">
                {overlayImageEl ? "Bytt overlay" : "Legg til overlay"}
              </button>
              {overlayImageEl && (
                <>
                  <input type="range" min={5} max={80} value={Math.round(overlayOpacity * 100)}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                    className="w-16 h-1 accent-primary" />
                  <span className="text-[10px] text-muted-foreground w-7">{Math.round(overlayOpacity * 100)}%</span>
                  <button onClick={() => setOverlayImageEl(null)} className="text-xs text-destructive cursor-pointer">✕</button>
                </>
              )}
              <input ref={advOverlayRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleAdvUpload(e, setOverlayImageEl)} />
            </div>

            {/* Contrast warning */}
            {(lowContrast || bgImageEl || overlayImageEl) && (
              <div className="flex items-start justify-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="text-[11px]">
                  {lowContrast
                    ? "Lav kontrast — QR-koden kan bli vanskelig å skanne."
                    : "Sørg for nok kontrast slik at QR-koden forblir lesbar."}
                </span>
              </div>
            )}
          </>
        ) : (
          /* ═══════ SIMPLE MODE ═══════ */
          <>
            {/* Variant tabs */}
            <div className="flex flex-wrap gap-1 justify-center">
              {simpleVariants.map((v) => (
                <button key={v.key} onClick={() => {
                  if (v.key === "eget" && !customImage) simpleFileRef.current?.click();
                  else setVariant(v.key);
                }} className={tabCls(variant === v.key)}>
                  {v.label}
                </button>
              ))}
              <input ref={simpleFileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden" onChange={handleSimpleUpload} />
            </div>

            {/* Color */}
            <ColorPicker value={qrColor} onChange={setQrColor} />

            {/* Transparent */}
            <label className="flex items-center justify-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} className="rounded" />
              <span className="text-xs text-muted-foreground">Transparent bakgrunn</span>
            </label>

            {/* Canvases */}
            <div className="flex justify-center">
              <canvas ref={plainRef} className={`rounded-md ${variant === "vanlig" ? "" : "hidden"}`} />
              <canvas ref={pandaRef} className={`rounded-md ${variant === "panda" ? "" : "hidden"}`} />
              <canvas ref={catRef} className={`rounded-md ${variant === "katt" ? "" : "hidden"}`} />
              <canvas ref={propulseRef} className={`rounded-md ${variant === "propulse" ? "" : "hidden"}`} />
              <canvas ref={customRef} className={`rounded-md ${variant === "eget" ? "" : "hidden"}`} />
              {variant === "eget" && !customImage && (
                <button onClick={() => simpleFileRef.current?.click()}
                  className="w-[200px] h-[200px] rounded-md border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  Klikk for å velge bilde
                </button>
              )}
            </div>
            {variant === "eget" && customImage && (
              <div className="flex justify-center">
                <button onClick={() => simpleFileRef.current?.click()}
                  className="text-xs text-muted-foreground hover:text-primary cursor-pointer">Bytt bilde</button>
              </div>
            )}
          </>
        )}

        {/* Shared: errors, info, actions */}
        {imageError && <p className="text-xs text-destructive text-center">{imageError}</p>}

        <div className="space-y-1">
          <h3 className="font-medium text-sm truncate">{code.name}</h3>
          <a href={code.url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary truncate block flex items-center gap-1">
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">{code.url}</span>
          </a>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1 flex-1">
            <Download className="w-3.5 h-3.5" /> Last ned
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}
            className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
