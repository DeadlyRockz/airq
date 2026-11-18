import { classifyAqiByScale } from "../aqi/scales";
import { AqiReadingSchema, type AqiReading, type UserContext } from "../aqi/types";

export type DemoScenario = {
  id: string;
  label: string;
  description: string;
  reading: AqiReading;
  defaultContext: UserContext;
};

const delhiClass = classifyAqiByScale("INDIA_CPCB", 365);
const bengaluruClass = classifyAqiByScale("INDIA_CPCB", 128);
const laClass = classifyAqiByScale("US_EPA", 168);
const seattleClass = classifyAqiByScale("US_EPA", 34);

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "delhi-winter-smog",
    label: "Delhi - Winter Smog (CPCB 365)",
    description:
      "Severe urban particulate buildup with gas cooking indoors and a morning cycling commute.",
    reading: AqiReadingSchema.parse({
      locationName: "New Delhi, IN",
      country: "India",
      latitude: 28.6139,
      longitude: 77.209,
      scale: delhiClass.scale,
      value: delhiClass.value,
      category: delhiClass.category,
      riskTier: delhiClass.riskTier,
      dominantPollutant: "PM2.5",
      pollutants: { pm2_5: 205, pm10: 310, no2: 74, o3: 32 },
      source: "AirQ Curated Sample Dataset",
      unit: delhiClass.unit,
      timestamp: "2026-11-18T06:30:00Z",
      observationType: "sample_fixture",
      uncertainty:
        "Sample fixture representing typical November inversion episode; local street-level PM2.5 can vary ±25%.",
      isSampleData: true,
    }),
    defaultContext: {
      locationLabel: "New Delhi, IN",
      preferredScale: "INDIA_CPCB",
      sensitivityGroup: "general",
      commuteMode: "walk_cycle",
      activityGoal: "commute",
      indoorFuelSource: "gas_stove_unvented",
      hasHepaPurifier: true,
      hasIndoorSensor: false,
    },
  },
  {
    id: "bengaluru-moderate",
    label: "Bengaluru - Traffic Haze (CPCB 128)",
    description: "Moderately polluted arterial corridor with an asthma-sensitive commuter.",
    reading: AqiReadingSchema.parse({
      locationName: "Bengaluru, IN",
      country: "India",
      latitude: 12.9716,
      longitude: 77.5946,
      scale: bengaluruClass.scale,
      value: bengaluruClass.value,
      category: bengaluruClass.category,
      riskTier: bengaluruClass.riskTier,
      dominantPollutant: "PM10",
      pollutants: { pm2_5: 58, pm10: 142, no2: 52, o3: 48 },
      source: "AirQ Curated Sample Dataset",
      unit: bengaluruClass.unit,
      timestamp: "2026-11-18T08:00:00Z",
      observationType: "sample_fixture",
      uncertainty: "Sample fixture for rush-hour corridor; residential neighborhoods may be lower.",
      isSampleData: true,
    }),
    defaultContext: {
      locationLabel: "Bengaluru, IN",
      preferredScale: "INDIA_CPCB",
      sensitivityGroup: "sensitive_respiratory",
      commuteMode: "public_transit",
      activityGoal: "commute",
      indoorFuelSource: "none_electric",
      hasHepaPurifier: false,
      hasIndoorSensor: false,
    },
  },
  {
    id: "los-angeles-smoke",
    label: "Los Angeles - Smoke & Ozone (US EPA 168)",
    description: "Unhealthy afternoon ozone and wildfire smoke impacting an outdoor runner.",
    reading: AqiReadingSchema.parse({
      locationName: "Los Angeles, US",
      country: "United States",
      latitude: 34.0522,
      longitude: -118.2437,
      scale: laClass.scale,
      value: laClass.value,
      category: laClass.category,
      riskTier: laClass.riskTier,
      dominantPollutant: "O3",
      pollutants: { pm2_5: 76, pm10: 94, no2: 45, o3: 155 },
      source: "AirQ Curated Sample Dataset",
      unit: laClass.unit,
      timestamp: "2026-11-18T15:00:00Z",
      observationType: "sample_fixture",
      uncertainty: "Sample fixture for basin smoke/ozone event; coastal zones may read lower.",
      isSampleData: true,
    }),
    defaultContext: {
      locationLabel: "Los Angeles, US",
      preferredScale: "US_EPA",
      sensitivityGroup: "general",
      commuteMode: "walk_cycle",
      activityGoal: "outdoor_exercise",
      indoorFuelSource: "none_electric",
      hasHepaPurifier: true,
      hasIndoorSensor: true,
    },
  },
  {
    id: "seattle-clean",
    label: "Seattle - Clean Marine Air (US EPA 34)",
    description: "Low-pollution day ideal for active travel and natural indoor ventilation.",
    reading: AqiReadingSchema.parse({
      locationName: "Seattle, US",
      country: "United States",
      latitude: 47.6062,
      longitude: -122.3321,
      scale: seattleClass.scale,
      value: seattleClass.value,
      category: seattleClass.category,
      riskTier: seattleClass.riskTier,
      dominantPollutant: "PM2.5",
      pollutants: { pm2_5: 8.2, pm10: 14.5, no2: 18, o3: 42 },
      source: "AirQ Curated Sample Dataset",
      unit: seattleClass.unit,
      timestamp: "2026-11-18T10:00:00Z",
      observationType: "sample_fixture",
      uncertainty: "Sample fixture representing post-rain marine air.",
      isSampleData: true,
    }),
    defaultContext: {
      locationLabel: "Seattle, US",
      preferredScale: "US_EPA",
      sensitivityGroup: "general",
      commuteMode: "walk_cycle",
      activityGoal: "outdoor_exercise",
      indoorFuelSource: "none_electric",
      hasHepaPurifier: false,
      hasIndoorSensor: false,
    },
  },
];

/**
 * Looks up a deterministic demo scenario by ID, defaulting to the first scenario.
 *
 * @param id - Scenario identifier.
 * @returns Matching DemoScenario.
 * @example
 * const scenario = getDemoScenarioById("delhi-winter-smog");
 */
export function getDemoScenarioById(id: string): DemoScenario {
  return DEMO_SCENARIOS.find((s) => s.id === id) ?? DEMO_SCENARIOS[0]!;
}
