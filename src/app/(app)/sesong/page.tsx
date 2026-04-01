import { Sprout } from "lucide-react";

export default function SesongPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-2">
        I sesong
      </h1>
      <p className="text-muted-foreground mb-8">
        Se hva som er i sesong i Norge akkurat nå.
      </p>
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Sprout className="w-12 h-12 mb-4 opacity-30" />
        <p>Sesongoversikten kommer snart</p>
      </div>
    </div>
  );
}
