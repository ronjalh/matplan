"use client";

import { useState, useRef, useCallback } from "react";
import bwipjs from "bwip-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

export function DataMatrixView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("");
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(() => {
    if (!canvasRef.current || !text.trim()) return;
    setError(null);
    try {
      bwipjs.toCanvas(canvasRef.current, {
        bcid: "datamatrix",
        text: text.trim(),
        scale: 4,
        paddingwidth: 4,
        paddingheight: 4,
      });
      setGenerated(true);
    } catch {
      setError("Kunne ikke generere Data Matrix. Sjekk teksten.");
      setGenerated(false);
    }
  }, [text]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "data-matrix.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Skriv inn teksten som skal kodes i en Data Matrix-strekkode.
        </p>
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tekst som skal kodes..."
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
          <Button onClick={generate} disabled={!text.trim()}>
            Generer
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className={`rounded-md ${generated ? "" : "hidden"}`}
          />
        </div>
        {generated && (
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1 w-full">
            <Download className="w-3.5 h-3.5" /> Last ned
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
