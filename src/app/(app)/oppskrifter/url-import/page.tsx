import { UrlImportForm } from "./url-import-form";

export default function UrlImportPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-1">
          Importer oppskrift fra URL
        </h1>
        <p className="text-muted-foreground">
          Lim inn en lenke fra matprat.no eller andre oppskriftssider.
        </p>
      </div>
      <UrlImportForm />
    </div>
  );
}
