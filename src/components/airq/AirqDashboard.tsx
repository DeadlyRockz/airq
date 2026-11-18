"use client";

import { useCallback, useEffect, useState } from "react";
import { Wind } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import type { GroundedExplanation } from "@/lib/ai/explain";
import type { AqiReading, UserContext } from "@/lib/aqi/types";
import { getDemoScenarioById } from "@/lib/fixtures/scenarios";
import { evaluateAirQualityPolicy, type PolicyRecommendation } from "@/lib/policy/engine";
import { loadSessionState, saveSessionState } from "@/lib/storage/session-context";
import { AqiAttributionCard } from "./AqiAttributionCard";
import { ContextBuilderForm } from "./ContextBuilderForm";
import { ExplanationPanel } from "./ExplanationPanel";
import { RecommendationBoard } from "./RecommendationBoard";

const initialScenario = getDemoScenarioById("delhi-winter-smog");
const initialPolicy = evaluateAirQualityPolicy(
  initialScenario.defaultContext,
  initialScenario.reading
);

type AirqDashboardProps = {
  initialExplanation: GroundedExplanation;
  initialExplainMode: "genai" | "deterministic-fallback";
};

/**
 * Interactive AirQ dashboard orchestrating browser geolocation, live-first AQI lookups
 * (with automatic labeled sample fallback), deterministic safety policy evaluation,
 * and grounded explanations.
 *
 * @param props - Server-rendered initial explanation and mode.
 * @returns Full AirqDashboard view.
 * @example
 * <AirqDashboard initialExplanation={exp} initialExplainMode="deterministic-fallback" />
 */
export function AirqDashboard({ initialExplanation, initialExplainMode }: AirqDashboardProps) {
  const [context, setContext] = useState<UserContext>(initialScenario.defaultContext);

  const [reading, setReading] = useState<AqiReading | null>(initialScenario.reading);
  const [policy, setPolicy] = useState<PolicyRecommendation | null>(initialPolicy);
  const [responseMode, setResponseMode] = useState<"demo" | "live" | "fallback">("demo");
  const [fallbackReason, setFallbackReason] = useState<string | undefined>();

  const [explanation, setExplanation] = useState<GroundedExplanation | null>(initialExplanation);
  const [explainMode, setExplainMode] = useState<"genai" | "deterministic-fallback" | null>(
    initialExplainMode
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationHint, setLocationHint] = useState<string | undefined>();
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchExplanation = useCallback(
    async (nextContext: UserContext, nextReading: AqiReading) => {
      setIsExplaining(true);
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context: nextContext, reading: nextReading }),
        });
        if (!res.ok) {
          throw new Error("Unable to load explanation.");
        }
        const data = (await res.json()) as {
          mode: "genai" | "deterministic-fallback";
          explanation: GroundedExplanation;
        };
        setExplainMode(data.mode);
        setExplanation(data.explanation);
      } catch {
        setExplainMode(null);
        setExplanation(null);
      } finally {
        setIsExplaining(false);
      }
    },
    []
  );

  const runAssessment = useCallback(
    async (targetContext: UserContext) => {
      saveSessionState({ context: targetContext });
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch("/api/air-quality", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "live",
            context: targetContext,
          }),
        });

        if (!res.ok) {
          const errJson = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(errJson.error ?? "Failed to evaluate air quality.");
        }

        const data = (await res.json()) as {
          mode: "demo" | "live" | "fallback";
          fallbackReason?: string;
          reading: AqiReading;
          policy: PolicyRecommendation;
        };

        setReading(data.reading);
        setPolicy(data.policy);
        setResponseMode(data.mode);
        setFallbackReason(data.fallbackReason);

        await fetchExplanation(targetContext, data.reading);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Unexpected error evaluating air quality."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [fetchExplanation]
  );

  const requestBrowserLocation = useCallback(
    (baseContext: UserContext) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setLocationHint(
          "Browser location unavailable — type a city to pick from search suggestions."
        );
        void runAssessment(baseContext);
        return;
      }

      setIsLocating(true);
      setLocationHint(undefined);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const locatedContext: UserContext = {
            ...baseContext,
            locationLabel: `Current Location (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`,
            coordinates: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
          };
          setContext(locatedContext);
          void runAssessment(locatedContext);
        },
        () => {
          setIsLocating(false);
          setLocationHint(
            "Location access denied — type a city above to choose from search suggestions."
          );
          void runAssessment(baseContext);
        },
        { timeout: 6000, maximumAge: 300000 }
      );
    },
    [runAssessment]
  );

  useEffect(() => {
    const saved = loadSessionState();
    const timer = window.setTimeout(() => {
      if (saved?.context) {
        setContext(saved.context);
        void runAssessment(saved.context);
      } else {
        requestBrowserLocation(initialScenario.defaultContext);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [requestBrowserLocation, runAssessment]);

  const handleContextChange = (next: UserContext) => {
    setContext(next);
    saveSessionState({ context: next });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:sticky lg:top-6 lg:col-span-4 lg:self-start">
        <ContextBuilderForm
          context={context}
          isLoading={isLoading}
          isLocating={isLocating}
          locationHint={locationHint}
          onContextChange={handleContextChange}
          onRequestLocation={() => requestBrowserLocation(context)}
          onSelectCity={(next) => {
            setContext(next);
            void runAssessment(next);
          }}
          onSubmit={() => void runAssessment(context)}
        />
      </div>

      <div className="space-y-4 lg:col-span-8" aria-live="polite">
        {isLoading ? (
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-52 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={() => void runAssessment(context)} />
        ) : reading && policy ? (
          <>
            <AqiAttributionCard
              reading={reading}
              mode={responseMode}
              fallbackReason={fallbackReason}
            />
            <ExplanationPanel
              explanation={explanation}
              mode={explainMode}
              isLoading={isExplaining}
            />
            <RecommendationBoard policy={policy} />
          </>
        ) : (
          <EmptyState
            icon={Wind}
            title="No air quality assessment loaded"
            description="Allow location access or search a city to check live air quality."
          />
        )}
      </div>
    </div>
  );
}
