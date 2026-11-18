import { Clock, Database, Info, Wind } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AqiReading, RiskTier } from "@/lib/aqi/types";

type AqiAttributionCardProps = {
  reading: AqiReading;
  mode: "demo" | "live" | "fallback";
  fallbackReason?: string;
};

function getBadgeVariant(tier: RiskTier): "default" | "secondary" | "destructive" | "outline" {
  if (tier === "high" || tier === "very_high" || tier === "severe") {
    return "destructive";
  }
  if (tier === "elevated") {
    return "default";
  }
  return "secondary";
}

function formatObservationLabel(type: AqiReading["observationType"]): string {
  switch (type) {
    case "observation":
      return "Station Observation";
    case "modeled_estimate":
      return "Modeled Estimate";
    case "forecast":
      return "Forecast";
    case "sample_fixture":
      return "Sample Fixture";
  }
}

/**
 * Displays AQI score, matching scale category, pollutant concentrations, and full
 * source/unit/timestamp/uncertainty attribution.
 *
 * @param props - Reading data, active mode, and optional fallback reason.
 * @returns AqiAttributionCard component.
 * @example
 * <AqiAttributionCard reading={reading} mode="demo" />
 */
export function AqiAttributionCard({ reading, mode, fallbackReason }: AqiAttributionCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={reading.isSampleData ? "outline" : "secondary"}>
              {reading.isSampleData ? "Sample / Demo Data" : "Live Modeled Data"}
            </Badge>
            <Badge variant="outline">{formatObservationLabel(reading.observationType)}</Badge>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-4" />
            {reading.timestamp}
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 font-heading text-xl font-semibold">
              <Wind className="size-5 text-primary" />
              {reading.locationName}
            </CardTitle>
            <CardDescription className="mt-1">{reading.unit}</CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-3xl font-bold text-foreground tabular-nums">
              {reading.value}
            </span>
            <Badge variant={getBadgeVariant(reading.riskTier)}>{reading.category}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {mode === "fallback" && fallbackReason && (
          <Alert>
            <Info className="size-4" />
            <AlertTitle>Fallback active</AlertTitle>
            <AlertDescription>{fallbackReason}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted p-3">
            <p className="text-xs text-muted-foreground">Dominant</p>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground">
              {reading.dominantPollutant}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted p-3">
            <p className="text-xs text-muted-foreground">PM2.5 (µg/m³)</p>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground tabular-nums">
              {reading.pollutants.pm2_5 ?? "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted p-3">
            <p className="text-xs text-muted-foreground">PM10 (µg/m³)</p>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground tabular-nums">
              {reading.pollutants.pm10 ?? "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted p-3">
            <p className="text-xs text-muted-foreground">O3 / NO2 (µg/m³)</p>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground tabular-nums">
              {reading.pollutants.o3 ?? "-"} / {reading.pollutants.no2 ?? "-"}
            </p>
          </div>
        </div>

        <div className="space-y-1 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <Database className="size-4 text-primary" />
            Source: {reading.source}
          </p>
          <p>Uncertainty: {reading.uncertainty}</p>
        </div>
      </CardContent>
    </Card>
  );
}
