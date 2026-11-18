import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { GroundedExplanation } from "@/lib/ai/explain";

type ExplanationPanelProps = {
  explanation: GroundedExplanation | null;
  mode: "genai" | "deterministic-fallback" | null;
  isLoading: boolean;
};

/**
 * Displays the grounded GenAI explanation (or deterministic fallback) with transparent
 * mode attribution and assumption notes.
 *
 * @param props - Explanation payload, active mode, and loading flag.
 * @returns ExplanationPanel card.
 * @example
 * <ExplanationPanel explanation={exp} mode="deterministic-fallback" isLoading={false} />
 */
export function ExplanationPanel({ explanation, mode, isLoading }: ExplanationPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
            <Bot className="size-4 text-primary" />
            Grounded Explanation
          </CardTitle>
          <CardDescription>
            Strictly constrained to verified AQI data and deterministic safety rules.
          </CardDescription>
        </div>
        {mode && (
          <Badge variant={mode === "genai" ? "secondary" : "outline"}>
            {mode === "genai" ? "GenAI Grounded" : "Deterministic Fallback"}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : explanation ? (
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">{explanation.headline}</p>
            <p className="text-muted-foreground">{explanation.whyItMatters}</p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Trade-off: </span>
              {explanation.tradeOffSummary}
            </p>
            <p className="text-xs text-muted-foreground">{explanation.assumptionNote}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Run an assessment to generate a grounded explanation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
