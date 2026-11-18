import { AirqDashboard } from "@/components/airq/AirqDashboard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { buildDeterministicExplanation } from "@/lib/ai/explain";
import { getDemoScenarioById } from "@/lib/fixtures/scenarios";
import { evaluateAirQualityPolicy } from "@/lib/policy/engine";

/**
 * Main AirQ application page composing the header, theme toggle, and interactive dashboard.
 * Pre-computes the initial demo explanation on the server for instant static-first rendering.
 *
 * @returns HomePage element.
 * @example
 * <HomePage />
 */
export default function HomePage() {
  const initialScenario = getDemoScenarioById("delhi-winter-smog");
  const initialPolicy = evaluateAirQualityPolicy(
    initialScenario.defaultContext,
    initialScenario.reading
  );
  const initialExplanation = buildDeterministicExplanation(
    initialScenario.defaultContext,
    initialScenario.reading,
    initialPolicy
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="AirQ"
        description="Safety-aware urban air quality assistant with transparent AQI scales, indoor precautions, and grounded explanations."
        action={<ThemeToggle />}
      />
      <AirqDashboard
        initialExplanation={initialExplanation}
        initialExplainMode="deterministic-fallback"
      />
    </main>
  );
}
