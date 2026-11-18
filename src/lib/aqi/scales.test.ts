import { describe, expect, it } from "vitest";
import {
  classifyAqiByScale,
  classifyCpcbAqi,
  classifyUsAqi,
  deriveCpcbFromPollutants,
} from "./scales";

describe("AQI scale classification", () => {
  it("distinguishes US EPA AQI and India CPCB AQI categories at identical numeric values", () => {
    const us120 = classifyUsAqi(120);
    const cpcb120 = classifyCpcbAqi(120);

    expect(us120.category).toBe("Unhealthy for Sensitive Groups");
    expect(us120.riskTier).toBe("elevated");

    expect(cpcb120.category).toBe("Moderately Polluted");
    expect(cpcb120.riskTier).toBe("elevated");

    const us350 = classifyUsAqi(350);
    const cpcb350 = classifyCpcbAqi(350);

    expect(us350.category).toBe("Hazardous");
    expect(us350.riskTier).toBe("severe");

    expect(cpcb350.category).toBe("Very Poor");
    expect(cpcb350.riskTier).toBe("very_high");
  });

  it("handles CPCB boundary thresholds accurately", () => {
    expect(classifyCpcbAqi(50).category).toBe("Good");
    expect(classifyCpcbAqi(51).category).toBe("Satisfactory");
    expect(classifyCpcbAqi(100).category).toBe("Satisfactory");
    expect(classifyCpcbAqi(101).category).toBe("Moderately Polluted");
    expect(classifyCpcbAqi(201).category).toBe("Poor");
    expect(classifyCpcbAqi(301).category).toBe("Very Poor");
    expect(classifyCpcbAqi(401).category).toBe("Severe");
  });

  it("dispatches cleanly by scale", () => {
    expect(classifyAqiByScale("US_EPA", 175).category).toBe("Unhealthy");
    expect(classifyAqiByScale("INDIA_CPCB", 175).category).toBe("Moderately Polluted");
  });

  it("derives CPCB sub-index maximum from raw pollutants", () => {
    const derived = deriveCpcbFromPollutants({ pm2_5: 90, pm10: 100 });
    expect(derived).not.toBeNull();
    expect(derived?.dominantPollutant).toBe("PM2.5");
    expect(derived?.value).toBe(200);
  });

  it("returns null when no pollutants are provided", () => {
    expect(deriveCpcbFromPollutants({})).toBeNull();
  });
});
