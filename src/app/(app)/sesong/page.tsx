import { seasonalProduce, getSeasonalStatus, type SeasonalStatus } from "@/data/seasonal-produce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Warehouse, Plane } from "lucide-react";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Des",
];

const statusConfig: Record<SeasonalStatus, { label: string; color: string; icon: typeof Sprout }> = {
  "in-season": { label: "I sesong", color: "var(--color-success)", icon: Sprout },
  "from-storage": { label: "Lagervare", color: "var(--color-fish)", icon: Warehouse },
  "imported": { label: "Import", color: "var(--muted-foreground)", icon: Plane },
};

export default function SesongPage() {
  const currentMonth = new Date().getMonth() + 1;

  // Group produce by category
  const categories = {
    groennsaker: seasonalProduce.filter((p) => p.category === "groennsaker"),
    frukt: seasonalProduce.filter((p) => p.category === "frukt"),
    baer: seasonalProduce.filter((p) => p.category === "baer"),
    urter: seasonalProduce.filter((p) => p.category === "urter"),
  };

  const categoryLabels: Record<string, string> = {
    groennsaker: "Grønnsaker",
    frukt: "Frukt",
    baer: "Bær",
    urter: "Urter",
  };

  // Count what's available now
  const inSeason = seasonalProduce.filter((p) => getSeasonalStatus(p, currentMonth) === "in-season");
  const fromStorage = seasonalProduce.filter((p) => getSeasonalStatus(p, currentMonth) === "from-storage");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-1">
          I sesong — {monthNames[currentMonth - 1]}
        </h1>
        <p className="text-muted-foreground">
          {inSeason.length} råvarer i sesong, {fromStorage.length} lagervarer tilgjengelig i Norge.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="flex items-center gap-1.5">
          <Sprout className="w-4 h-4 text-[var(--color-success)]" />
          I sesong (høstes nå)
        </span>
        <span className="flex items-center gap-1.5">
          <Warehouse className="w-4 h-4 text-[var(--color-fish)]" />
          Lagervare (norsk)
        </span>
        <span className="flex items-center gap-1.5">
          <Plane className="w-4 h-4 text-muted-foreground" />
          Import
        </span>
      </div>

      {/* Categories */}
      {Object.entries(categories).map(([key, items]) => (
        <Card key={key}>
          <CardHeader className="py-3">
            <CardTitle className="text-base">{categoryLabels[key]}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((produce) => {
                const status = getSeasonalStatus(produce, currentMonth);
                const config = statusConfig[status];
                const Icon = config.icon;

                return (
                  <div
                    key={produce.name}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                      status === "imported" ? "opacity-40" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: config.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{produce.name}</span>
                      {produce.region && (
                        <span className="block text-xs text-muted-foreground truncate">
                          {produce.region}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0"
                      style={{ borderColor: config.color, color: config.color }}
                    >
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Monthly calendar grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sesongkalender</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1 pr-2 font-medium text-muted-foreground sticky left-0 bg-card">Råvare</th>
                  {monthNames.map((m, i) => (
                    <th
                      key={m}
                      className={`text-center py-1 px-1 font-medium ${
                        i + 1 === currentMonth ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seasonalProduce
                  .filter((p) => p.category !== "urter")
                  .map((produce) => (
                    <tr key={produce.name} className="border-t border-border/50">
                      <td className="py-1 pr-2 font-medium sticky left-0 bg-card">{produce.name}</td>
                      {Array.from({ length: 12 }, (_, i) => {
                        const status = getSeasonalStatus(produce, i + 1);
                        return (
                          <td key={i} className="text-center py-1 px-1">
                            <div
                              className="w-4 h-4 rounded-sm mx-auto"
                              style={{
                                backgroundColor:
                                  status === "in-season" ? "var(--color-success)" :
                                  status === "from-storage" ? "var(--color-fish)" :
                                  "transparent",
                                opacity: status === "imported" ? 0.1 : 0.8,
                                border: i + 1 === currentMonth ? "2px solid var(--foreground)" : "none",
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
