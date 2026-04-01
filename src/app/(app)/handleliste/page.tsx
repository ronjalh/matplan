import { ShoppingCart } from "lucide-react";

export default function HandlelistePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-2">
        Handleliste
      </h1>
      <p className="text-muted-foreground mb-8">
        Generer handleliste fra ukeplanen.
      </p>
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ShoppingCart className="w-12 h-12 mb-4 opacity-30" />
        <p>Handlelisten kommer snart</p>
      </div>
    </div>
  );
}
