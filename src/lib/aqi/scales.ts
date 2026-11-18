import type { AqiScale, DominantPollutant, Pollutants, RiskTier } from "./types";

export type AqiClassification = {
  scale: AqiScale;
  value: number;
  category: string;
  riskTier: RiskTier;
  unit: string;
};

type Breakpoint = {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
};

const CPCB_PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
  { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
  { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
  { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
  { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
  { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
];

const CPCB_PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
  { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
  { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
  { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
];

const CPCB_NO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
  { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
  { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
  { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
  { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
  { cLow: 401, cHigh: 600, iLow: 401, iHigh: 500 },
];

const CPCB_O3_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
  { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
  { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
  { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
];

/**
 * Classifies a numeric US EPA AQI value into its official category and normalized risk tier.
 *
 * @param value - Non-negative US EPA AQI number.
 * @returns US EPA classification metadata.
 * @example
 * classifyUsAqi(125) // { scale: "US_EPA", value: 125, category: "Unhealthy for Sensitive Groups", riskTier: "elevated", ... }
 */
export function classifyUsAqi(value: number): AqiClassification {
  const rounded = Math.max(0, Math.round(value));
  const unit = "US EPA AQI (0–500)";

  if (rounded <= 50) {
    return { scale: "US_EPA", value: rounded, category: "Good", riskTier: "low", unit };
  }
  if (rounded <= 100) {
    return { scale: "US_EPA", value: rounded, category: "Moderate", riskTier: "moderate", unit };
  }
  if (rounded <= 150) {
    return {
      scale: "US_EPA",
      value: rounded,
      category: "Unhealthy for Sensitive Groups",
      riskTier: "elevated",
      unit,
    };
  }
  if (rounded <= 200) {
    return { scale: "US_EPA", value: rounded, category: "Unhealthy", riskTier: "high", unit };
  }
  if (rounded <= 300) {
    return {
      scale: "US_EPA",
      value: rounded,
      category: "Very Unhealthy",
      riskTier: "very_high",
      unit,
    };
  }
  return { scale: "US_EPA", value: rounded, category: "Hazardous", riskTier: "severe", unit };
}

/**
 * Classifies a numeric India CPCB AQI value into its official category and normalized risk tier.
 *
 * @param value - Non-negative India CPCB AQI number.
 * @returns India CPCB classification metadata.
 * @example
 * classifyCpcbAqi(245) // { scale: "INDIA_CPCB", value: 245, category: "Poor", riskTier: "high", ... }
 */
export function classifyCpcbAqi(value: number): AqiClassification {
  const rounded = Math.max(0, Math.round(value));
  const unit = "India CPCB AQI (0–500)";

  if (rounded <= 50) {
    return { scale: "INDIA_CPCB", value: rounded, category: "Good", riskTier: "low", unit };
  }
  if (rounded <= 100) {
    return {
      scale: "INDIA_CPCB",
      value: rounded,
      category: "Satisfactory",
      riskTier: "moderate",
      unit,
    };
  }
  if (rounded <= 200) {
    return {
      scale: "INDIA_CPCB",
      value: rounded,
      category: "Moderately Polluted",
      riskTier: "elevated",
      unit,
    };
  }
  if (rounded <= 300) {
    return { scale: "INDIA_CPCB", value: rounded, category: "Poor", riskTier: "high", unit };
  }
  if (rounded <= 400) {
    return {
      scale: "INDIA_CPCB",
      value: rounded,
      category: "Very Poor",
      riskTier: "very_high",
      unit,
    };
  }
  return { scale: "INDIA_CPCB", value: rounded, category: "Severe", riskTier: "severe", unit };
}

/**
 * Dispatches classification to the matching scale function without cross-scale mixing.
 *
 * @param scale - Target AQI scale ("US_EPA" or "INDIA_CPCB").
 * @param value - Numeric AQI value on that exact scale.
 * @returns Scale-matched classification.
 * @example
 * classifyAqiByScale("INDIA_CPCB", 350)
 */
export function classifyAqiByScale(scale: AqiScale, value: number): AqiClassification {
  return scale === "INDIA_CPCB" ? classifyCpcbAqi(value) : classifyUsAqi(value);
}

function interpolateSubIndex(concentration: number, breakpoints: Breakpoint[]): number {
  const clamped = Math.max(0, concentration);
  for (const bp of breakpoints) {
    if (clamped <= bp.cHigh) {
      const ratio = (clamped - bp.cLow) / Math.max(1, bp.cHigh - bp.cLow);
      return Math.round(bp.iLow + ratio * (bp.iHigh - bp.iLow));
    }
  }
  return 500;
}

/**
 * Derives an estimated India CPCB AQI sub-index maximum from raw pollutant concentrations (µg/m³).
 * Never derives CPCB AQI from Open-Meteo's `us_aqi`.
 *
 * @param pollutants - Pollutant concentrations in µg/m³.
 * @returns Estimated CPCB AQI value and dominant pollutant, or null if no supported pollutants are present.
 * @example
 * deriveCpcbFromPollutants({ pm2_5: 95, pm10: 140 })
 */
export function deriveCpcbFromPollutants(pollutants: Pollutants): {
  value: number;
  dominantPollutant: DominantPollutant;
} | null {
  const candidates: Array<{ pollutant: DominantPollutant; subIndex: number }> = [];

  if (typeof pollutants.pm2_5 === "number") {
    candidates.push({
      pollutant: "PM2.5",
      subIndex: interpolateSubIndex(pollutants.pm2_5, CPCB_PM25_BREAKPOINTS),
    });
  }
  if (typeof pollutants.pm10 === "number") {
    candidates.push({
      pollutant: "PM10",
      subIndex: interpolateSubIndex(pollutants.pm10, CPCB_PM10_BREAKPOINTS),
    });
  }
  if (typeof pollutants.no2 === "number") {
    candidates.push({
      pollutant: "NO2",
      subIndex: interpolateSubIndex(pollutants.no2, CPCB_NO2_BREAKPOINTS),
    });
  }
  if (typeof pollutants.o3 === "number") {
    candidates.push({
      pollutant: "O3",
      subIndex: interpolateSubIndex(pollutants.o3, CPCB_O3_BREAKPOINTS),
    });
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => b.subIndex - a.subIndex);
  const top = candidates[0];
  if (!top) {
    return null;
  }
  return { value: top.subIndex, dominantPollutant: top.pollutant };
}
