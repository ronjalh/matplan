import { Settings } from "lucide-react";

export default function InnstillingerPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-2">
        Innstillinger
      </h1>
      <p className="text-muted-foreground mb-8">
        Tilpass appen — priskilde, kosthold, språk og tema.
      </p>
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Settings className="w-12 h-12 mb-4 opacity-30" />
        <p>Innstillinger kommer snart</p>
      </div>
    </div>
  );
}
