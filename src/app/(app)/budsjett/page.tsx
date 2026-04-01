import { Wallet } from "lucide-react";

export default function BudsjettPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-2">
        Budsjett
      </h1>
      <p className="text-muted-foreground mb-8">
        Hold styr på matbudsjettet og andre utgifter.
      </p>
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Wallet className="w-12 h-12 mb-4 opacity-30" />
        <p>Budsjettoversikten kommer snart</p>
      </div>
    </div>
  );
}
