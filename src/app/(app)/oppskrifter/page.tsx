import { ChefHat } from "lucide-react";

export default function OppskrifterPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-2">
        Oppskrifter
      </h1>
      <p className="text-muted-foreground mb-8">
        Søk blant 685 000+ oppskrifter eller lag dine egne.
      </p>
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ChefHat className="w-12 h-12 mb-4 opacity-30" />
        <p>Oppskriftsøk kommer snart</p>
      </div>
    </div>
  );
}
