"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importSpoonacularRecipe } from "../actions";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Check } from "lucide-react";

export function ImportButton({ spoonacularId }: { spoonacularId: number }) {
  const [status, setStatus] = useState<"idle" | "importing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleImport() {
    if (status === "importing" || status === "done") return;
    setStatus("importing");
    setError(null);
    try {
      const result = await importSpoonacularRecipe(spoonacularId);
      if (!result.success) {
        setError(result.error ?? "Noe gikk galt");
        setStatus("error");
      } else {
        setStatus("done");
        // Navigate to imported recipe after short delay
        setTimeout(() => {
          if (result.id) router.push(`/oppskrifter/${result.id}`);
        }, 1000);
      }
    } catch {
      setError("Import feilet. Prøv igjen.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleImport}
        disabled={status === "importing" || status === "done"}
        className="w-full gap-2"
        size="lg"
      >
        {status === "importing" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Importerer...</>
        ) : status === "done" ? (
          <><Check className="w-4 h-4" /> Importert! Videresender...</>
        ) : (
          <><Download className="w-4 h-4" /> Importer til mine oppskrifter</>
        )}
      </Button>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
