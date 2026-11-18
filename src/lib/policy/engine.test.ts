import { describe, expect, it } from "vitest";
import type { AqiReading, UserContext } from "../aqi/types";
import { evaluateAirQualityPolicy } from "./engine";

const baseContext: UserContext = {
  locationLabel: "Delhi",
  preferredScale: "INDIA_CPCB",
  sensitivityGroup: "general",
  commuteMode: "walk_cycle",
  activityGoal: "commute",
  indoorFuelSource: "none_electric",
  hasHepaPurifier: false,
  hasIndoorSensor: false,
};

const severeReading: AqiReading = {
  locationName: "Delhi",
  scale: "INDIA_CPCB",
  value: 380,
  category: "Very Poor",
  riskTier: "very_high",
  dominantPollutant: "PM2.5",
  pollutants: { pm2_5: 220, pm10: 340 },
  source: "AirQ Curated Sample Dataset",
  unit: "India CPCB AQI (0–500)",
  timestamp: "2026-11-18T06:00:00Z",
  observationType: "sample_fixture",
  uncertainty: "Representative winter smog fixture.",
  isSampleData: true,
};

describe("evaluateAirQualityPolicy", () => {
  it("prioritizes exposure safety over low-carbon cycling during high smog", () => {
    const rec = evaluateAirQualityPolicy(baseContext, severeReading);

    expect(rec.effectiveRiskTier).toBe("very_high");
    expect(rec.sustainableAlternatives[0]?.priority).toBe("critical");
    expect(rec.sustainableAlternatives[0]?.title).toContain("pause unmasked walking or cycling");
    expect(rec.tradeOffs[0]).toContain("emissions");
  });

  it("never advises sealing the home when an unvented gas stove or solid fuel is present", () => {
    const gasContext: UserContext = {
      ...baseContext,
      indoorFuelSource: "gas_stove_unvented",
    };
    const rec = evaluateAirQualityPolicy(gasContext, severeReading);

    const titles = rec.indoorAirGuidance.map((item) => item.title).join(" ");
    expect(titles).toContain("Do NOT seal your home");
    expect(titles).not.toContain("Keep windows closed");
  });

  it("explicitly states indoor air cannot be verified without sensors", () => {
    const rec = evaluateAirQualityPolicy(baseContext, severeReading);
    const combined = rec.indoorAirGuidance.map((item) => item.title).join(" ");
    expect(combined).toContain("cannot be verified without sensors");
  });

  it("escalates effective risk tier for sensitive respiratory users at moderate/elevated AQI", () => {
    const moderateReading: AqiReading = {
      ...severeReading,
      scale: "US_EPA",
      value: 85,
      category: "Moderate",
      riskTier: "moderate",
      unit: "US EPA AQI (0–500)",
    };
    const sensitiveContext: UserContext = {
      ...baseContext,
      preferredScale: "US_EPA",
      sensitivityGroup: "sensitive_respiratory",
    };

    const rec = evaluateAirQualityPolicy(sensitiveContext, moderateReading);
    expect(rec.effectiveRiskTier).toBe("elevated");
  });

  it("includes non-diagnostic disclaimer and documented assumptions", () => {
    const rec = evaluateAirQualityPolicy(baseContext, severeReading);
    expect(rec.safetyNotices.some((n) => n.includes("does not provide medical diagnoses"))).toBe(
      true
    );
    expect(rec.assumptions.length).toBeGreaterThanOrEqual(2);
  });
});
