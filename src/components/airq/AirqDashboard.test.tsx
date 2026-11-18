import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDemoScenarioById } from "@/lib/fixtures/scenarios";
import { evaluateAirQualityPolicy } from "@/lib/policy/engine";
import { AirqDashboard } from "./AirqDashboard";

describe("AirqDashboard", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("requests live air quality and explanation, displaying fallback notice when fallback mode returns", async () => {
    const scenario = getDemoScenarioById("delhi-winter-smog");
    const policy = evaluateAirQualityPolicy(scenario.defaultContext, scenario.reading);

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              mode: "fallback",
              fallbackReason: "Upstream unavailable. Showing labeled sample data instead.",
              reading: scenario.reading,
              policy,
            }),
            { status: 200 }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              mode: "deterministic-fallback",
              explanation: {
                headline: policy.headline,
                whyItMatters: "PM2.5 is very poor today.",
                tradeOffSummary: "Avoid unmasked outdoor cycling.",
                assumptionNote: "Based on India CPCB AQI thresholds.",
              },
            }),
            { status: 200 }
          )
        )
    );

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (_success: unknown, error: () => void) => error(),
      },
    });

    render(
      <AirqDashboard
        initialExplanation={{
          headline: policy.headline,
          whyItMatters: "Initial summary.",
          tradeOffSummary: "Initial trade-off.",
          assumptionNote: "Initial assumption.",
        }}
        initialExplainMode="deterministic-fallback"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Fallback active")).toBeInTheDocument();
    });
    expect(screen.getByText(/Location access denied — type a city above/)).toBeInTheDocument();
  });
});
