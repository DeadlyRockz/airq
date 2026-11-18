import { describe, expect, it } from "vitest";
import { AqiReadingSchema, UserContextSchema } from "../aqi/types";
import { evaluateAirQualityPolicy } from "../policy/engine";
import { DEMO_SCENARIOS, getDemoScenarioById } from "./scenarios";

describe("DEMO_SCENARIOS", () => {
  it("validates every scenario reading and default context with Zod", () => {
    for (const scenario of DEMO_SCENARIOS) {
      expect(() => AqiReadingSchema.parse(scenario.reading)).not.toThrow();
      expect(() => UserContextSchema.parse(scenario.defaultContext)).not.toThrow();
      expect(scenario.reading.isSampleData).toBe(true);
    }
  });

  it("produces distinct recommendations across severe vs clean scenarios", () => {
    const delhi = getDemoScenarioById("delhi-winter-smog");
    const seattle = getDemoScenarioById("seattle-clean");

    const delhiRec = evaluateAirQualityPolicy(delhi.defaultContext, delhi.reading);
    const seattleRec = evaluateAirQualityPolicy(seattle.defaultContext, seattle.reading);

    expect(delhiRec.effectiveRiskTier).toBe("very_high");
    expect(seattleRec.effectiveRiskTier).toBe("low");
    expect(delhiRec.headline).not.toBe(seattleRec.headline);
    expect(delhiRec.dailyRoutineActions[0]?.priority).toBe("critical");
    expect(seattleRec.dailyRoutineActions[0]?.priority).toBe("optional");
  });

  it("changes indoor advice when indoor fuel source changes on the same reading", () => {
    const delhi = getDemoScenarioById("delhi-winter-smog");
    const withGas = evaluateAirQualityPolicy(
      { ...delhi.defaultContext, indoorFuelSource: "gas_stove_unvented" },
      delhi.reading
    );
    const allElectric = evaluateAirQualityPolicy(
      { ...delhi.defaultContext, indoorFuelSource: "none_electric" },
      delhi.reading
    );

    expect(withGas.indoorAirGuidance[0]?.title).toContain("Do NOT seal your home");
    expect(allElectric.indoorAirGuidance[0]?.title).toContain("Keep windows closed");
  });
});
