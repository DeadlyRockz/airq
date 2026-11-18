import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getDemoScenarioById } from "@/lib/fixtures/scenarios";
import { evaluateAirQualityPolicy } from "@/lib/policy/engine";
import { AqiAttributionCard } from "./AqiAttributionCard";
import { ContextBuilderForm } from "./ContextBuilderForm";
import { ExplanationPanel } from "./ExplanationPanel";
import { RecommendationBoard } from "./RecommendationBoard";

describe("AirQ UI components", () => {
  it("renders Sample / Demo Data badge, scale unit, source, and uncertainty on AqiAttributionCard", () => {
    const scenario = getDemoScenarioById("delhi-winter-smog");
    render(<AqiAttributionCard reading={scenario.reading} mode="demo" />);

    expect(screen.getByText("Sample / Demo Data")).toBeInTheDocument();
    expect(screen.getByText("India CPCB AQI (0–500)")).toBeInTheDocument();
    expect(screen.getByText("365")).toBeInTheDocument();
    expect(screen.getByText(/AirQ Curated Sample Dataset/)).toBeInTheDocument();
  });

  it("renders capitalized priority badges, CO ventilation guard, and trade-offs on RecommendationBoard", () => {
    const scenario = getDemoScenarioById("delhi-winter-smog");
    const policy = evaluateAirQualityPolicy(scenario.defaultContext, scenario.reading);

    render(<RecommendationBoard policy={policy} />);

    expect(screen.getAllByText("Critical").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Do NOT seal your home while burning fuel/)).toBeInTheDocument();
    expect(screen.getByText(/Visible Trade-Offs/)).toBeInTheDocument();
    expect(screen.getByText(/does not provide medical diagnoses/)).toBeInTheDocument();
  });

  it("renders GenAI Grounded badge and explanation content on ExplanationPanel", () => {
    render(
      <ExplanationPanel
        mode="genai"
        isLoading={false}
        explanation={{
          headline: "Reduce outdoor exertion today.",
          whyItMatters: "PM2.5 is elevated.",
          tradeOffSummary: "Transit avoids heavy inhalation.",
          assumptionNote: "Based on CPCB scale.",
        }}
      />
    );

    expect(screen.getByText("GenAI Grounded")).toBeInTheDocument();
    expect(screen.getByText("Reduce outdoor exertion today.")).toBeInTheDocument();
  });

  it("triggers location request and submit callbacks in ContextBuilderForm", () => {
    const scenario = getDemoScenarioById("seattle-clean");
    const onRequestLocation = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ContextBuilderForm
        context={scenario.defaultContext}
        isLoading={false}
        isLocating={false}
        onContextChange={vi.fn()}
        onRequestLocation={onRequestLocation}
        onSelectCity={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Use My Location/i }));
    expect(onRequestLocation).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Check Air Quality/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
