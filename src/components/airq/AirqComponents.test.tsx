import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDemoScenarioById } from "@/lib/fixtures/scenarios";
import { evaluateAirQualityPolicy } from "@/lib/policy/engine";
import { AqiAttributionCard } from "./AqiAttributionCard";
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

  it("renders CO ventilation guard and trade-offs on RecommendationBoard", () => {
    const scenario = getDemoScenarioById("delhi-winter-smog");
    const policy = evaluateAirQualityPolicy(scenario.defaultContext, scenario.reading);

    render(<RecommendationBoard policy={policy} />);

    expect(screen.getByText(/Do NOT seal your home while burning fuel/)).toBeInTheDocument();
    expect(screen.getByText(/Visible Trade-Offs/)).toBeInTheDocument();
    expect(screen.getByText(/does not provide medical diagnoses/)).toBeInTheDocument();
  });
});
