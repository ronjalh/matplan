import { Calendar } from "lucide-react";

export default function KalenderPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-2">
        Kalender
      </h1>
      <p className="text-muted-foreground mb-8">
        Planlegg ukens måltider og aktiviteter.
      </p>
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Calendar className="w-12 h-12 mb-4 opacity-30" />
        <p>Kalenderen kommer snart</p>
      </div>
    </div>
  );
}
