import { AlertTriangle, Home, Leaf, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PolicyAction, PolicyRecommendation } from "@/lib/policy/engine";

type RecommendationBoardProps = {
  policy: PolicyRecommendation;
};

function priorityBadgeVariant(
  priority: PolicyAction["priority"]
): "destructive" | "secondary" | "outline" {
  if (priority === "critical") return "destructive";
  if (priority === "recommended") return "secondary";
  return "outline";
}

function formatPriorityLabel(priority: PolicyAction["priority"]): string {
  switch (priority) {
    case "critical":
      return "Critical";
    case "recommended":
      return "Recommended";
    case "optional":
      return "Optional";
  }
}

function ActionList({ actions }: { actions: PolicyAction[] }) {
  return (
    <ul className="space-y-3">
      {actions.map((action) => (
        <li key={action.title} className="rounded-lg border border-border bg-muted p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{action.title}</p>
            <Badge variant={priorityBadgeVariant(action.priority)}>
              {formatPriorityLabel(action.priority)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{action.detail}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Renders deterministic safety-aware daily routine, indoor air, sustainable alternative,
 * trade-off, and assumption cards.
 *
 * @param props - PolicyRecommendation computed by the deterministic engine.
 * @returns RecommendationBoard component.
 * @example
 * <RecommendationBoard policy={policy} />
 */
export function RecommendationBoard({ policy }: RecommendationBoardProps) {
  return (
    <div className="space-y-4">
      <Alert>
        <ShieldCheck className="size-4" />
        <AlertTitle>Safety-Aware Guidance</AlertTitle>
        <AlertDescription>{policy.headline}</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
              <Sparkles className="size-4 text-primary" />
              Daily Routine Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActionList actions={policy.dailyRoutineActions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
              <Home className="size-4 text-primary" />
              Indoor Air & Ventilation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActionList actions={policy.indoorAirGuidance} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
            <Leaf className="size-4 text-primary" />
            Sustainable Alternatives & Exposure Trade-Offs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ActionList actions={policy.sustainableAlternatives} />

          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Scale className="size-4 text-primary" />
              Visible Trade-Offs
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {policy.tradeOffs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
            <AlertTriangle className="size-4 text-warning" />
            Safety Notices & Documented Assumptions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            {policy.safetyNotices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
          <div className="border-t border-border pt-3">
            <p className="mb-1 text-xs font-medium text-foreground">Documented Assumptions</p>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              {policy.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
