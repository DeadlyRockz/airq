import { z } from "zod";
import type { AqiReading, RiskTier, UserContext } from "../aqi/types";

export const PolicyActionSchema = z.object({
  title: z.string(),
  detail: z.string(),
  priority: z.enum(["critical", "recommended", "optional"]),
});

export const PolicyRecommendationSchema = z.object({
  effectiveRiskTier: z.enum(["low", "moderate", "elevated", "high", "very_high", "severe"]),
  headline: z.string(),
  dailyRoutineActions: z.array(PolicyActionSchema).min(1),
  indoorAirGuidance: z.array(PolicyActionSchema).min(1),
  sustainableAlternatives: z.array(PolicyActionSchema).min(1),
  tradeOffs: z.array(z.string()).min(1),
  safetyNotices: z.array(z.string()).min(1),
  assumptions: z.array(z.string()).min(1),
});

export type PolicyAction = z.infer<typeof PolicyActionSchema>;
export type PolicyRecommendation = z.infer<typeof PolicyRecommendationSchema>;

const RISK_ORDER: RiskTier[] = ["low", "moderate", "elevated", "high", "very_high", "severe"];

function escalateRiskForSensitivity(baseTier: RiskTier, context: UserContext): RiskTier {
  const isSensitive =
    context.sensitivityGroup === "sensitive_respiratory" ||
    context.sensitivityGroup === "children_elderly";

  if (!isSensitive) {
    return baseTier;
  }

  const idx = RISK_ORDER.indexOf(baseTier);
  if (baseTier === "moderate" || baseTier === "elevated") {
    return RISK_ORDER[Math.min(idx + 1, RISK_ORDER.length - 1)]!;
  }
  return baseTier;
}

function isHighExposureRisk(tier: RiskTier): boolean {
  return tier === "high" || tier === "very_high" || tier === "severe";
}

/**
 * Deterministically evaluates an AQI reading against user context to produce safety-first
 * daily routine changes, indoor air advice, sustainable alternatives, trade-offs, and assumptions.
 *
 * @param context - Validated user lifestyle, sensitivity, and indoor environment context.
 * @param reading - Validated AQI reading with scale, category, and attribution.
 * @returns Structured policy recommendation.
 * @example
 * const rec = evaluateAirQualityPolicy(context, reading);
 */
export function evaluateAirQualityPolicy(
  context: UserContext,
  reading: AqiReading
): PolicyRecommendation {
  const effectiveRiskTier = escalateRiskForSensitivity(reading.riskTier, context);
  const highSmog = isHighExposureRisk(effectiveRiskTier);
  const isSensitive = context.sensitivityGroup !== "general";

  const dailyRoutineActions: PolicyAction[] = [];
  const indoorAirGuidance: PolicyAction[] = [];
  const sustainableAlternatives: PolicyAction[] = [];
  const tradeOffs: string[] = [];
  const safetyNotices: string[] = [];
  const assumptions: string[] = [
    `Category and risk thresholds strictly use ${
      reading.scale === "INDIA_CPCB" ? "India CPCB AQI (0–500)" : "US EPA AQI (0–500)"
    } without cross-scale conversion.`,
    "Respiratory dose increases during vigorous outdoor exertion because minute ventilation rises substantially compared to resting or seated travel.",
  ];

  // 1. Headline
  const headline = highSmog
    ? `Prioritize exposure reduction in ${reading.locationName} (${reading.category}, ${reading.value} on ${reading.scale === "INDIA_CPCB" ? "CPCB" : "US EPA"} scale).`
    : effectiveRiskTier === "elevated"
      ? `Moderate-to-elevated air quality in ${reading.locationName} (${reading.category}); adjust outdoor timing and exertion.`
      : `Air quality in ${reading.locationName} is ${reading.category} (${reading.value}); normal routines are generally suitable.`;

  // 2. Daily routine actions
  if (effectiveRiskTier === "severe" || effectiveRiskTier === "very_high") {
    dailyRoutineActions.push({
      title: "Move strenuous activity indoors",
      detail:
        context.activityGoal === "outdoor_exercise"
          ? "Cancel or move outdoor running/cycling indoors to avoid high particulate/ozone inhalation."
          : "Avoid prolonged outdoor exertion and reschedule non-essential outdoor errands.",
      priority: "critical",
    });
    dailyRoutineActions.push({
      title: "Use a well-fitted N95 / FFP2 respirator if going outside",
      detail:
        "Cloth or loose surgical masks do not seal against fine particulate matter (PM2.5). A tight facial seal is required for effective filtration.",
      priority: "critical",
    });
  } else if (effectiveRiskTier === "high" || effectiveRiskTier === "elevated") {
    dailyRoutineActions.push({
      title: "Reduce outdoor exertion intensity and duration",
      detail:
        context.activityGoal === "outdoor_exercise"
          ? "Switch to lower-intensity movement or an indoor workout; avoid peak traffic corridors."
          : "Shift outdoor errands to periods with lower traffic and lower ozone/particulate buildup.",
      priority: highSmog ? "critical" : "recommended",
    });
    if (isSensitive || highSmog) {
      dailyRoutineActions.push({
        title: "Keep a well-fitted N95 / FFP2 mask available for street exposure",
        detail:
          "Especially helpful near busy roadways or during visible haze if outdoor travel cannot be avoided.",
        priority: "recommended",
      });
    }
  } else {
    dailyRoutineActions.push({
      title: "Normal outdoor schedule is appropriate",
      detail:
        isSensitive && effectiveRiskTier === "moderate"
          ? "Air quality is acceptable, though unusually sensitive individuals should monitor symptoms during prolonged exertion."
          : "Conditions support regular outdoor exercise, errands, and active commuting.",
      priority: "optional",
    });
  }

  // 3. Indoor air guidance (with CO/fuel-burning & no-sensor guards)
  if (context.indoorFuelSource !== "none_electric") {
    indoorAirGuidance.push({
      title: "Do NOT seal your home while burning fuel or cooking with gas",
      detail:
        "Unvented gas stoves, kerosene, or solid-fuel cooking/heating emit nitrogen dioxide (NO2) and carbon monoxide (CO). Keep kitchen exhaust fans running or crack a window for cross-ventilation during cooking, even when outdoor AQI is poor.",
      priority: "critical",
    });
  } else if (highSmog) {
    indoorAirGuidance.push({
      title: "Keep windows closed during peak outdoor smog",
      detail:
        "Since no indoor fuel-burning source is selected, closing windows helps limit outdoor PM2.5 infiltration during high-pollution hours.",
      priority: "recommended",
    });
  } else {
    indoorAirGuidance.push({
      title: "Use natural ventilation when outdoor air is clean",
      detail:
        "Opening windows during low-AQI hours helps clear indoor CO2 and household pollutants.",
      priority: "recommended",
    });
  }

  if (context.hasHepaPurifier) {
    indoorAirGuidance.push({
      title: "Run your HEPA air purifier continuously in the main occupied room",
      detail:
        "Keep doors to unused rooms closed so the purifier's clean air delivery rate (CADR) matches the room volume.",
      priority: highSmog ? "critical" : "optional",
    });
  } else if (highSmog) {
    indoorAirGuidance.push({
      title: "Consider a HEPA-filtered clean-air room",
      detail:
        "If an air purifier is unavailable, spend extended rest/sleep hours in an interior room away from street-facing drafts.",
      priority: "recommended",
    });
  }

  if (!context.hasIndoorSensor) {
    indoorAirGuidance.push({
      title: "Indoor air quality cannot be verified without sensors",
      detail:
        "Without an indoor PM2.5, CO2, or CO monitor, AirQ cannot measure actual indoor pollutant levels; rely on ventilation safety cues and source control.",
      priority: "recommended",
    });
  }

  // 4. Sustainable alternatives & exposure-safety-first rule
  if (highSmog) {
    if (context.commuteMode === "walk_cycle") {
      sustainableAlternatives.push({
        title: "Temporarily pause unmasked walking or cycling commutes",
        detail:
          "During high smog, exposure safety takes priority over zero-emission outdoor travel. Use enclosed public transit, carpool with AC set to recirculate, or work remotely if available.",
        priority: "critical",
      });
      tradeOffs.push(
        "Switching from cycling/walking to enclosed transit or carpooling increases per-trip transport emissions today, but protects against elevated inhaled PM2.5/O3 dose during physical exertion."
      );
    } else {
      sustainableAlternatives.push({
        title: "Prefer electric rail/metro or remote work over solo car trips",
        detail:
          "Enclosed electric transit or working from home reduces both personal outdoor exposure and per-passenger tailpipe emissions.",
        priority: "recommended",
      });
      tradeOffs.push(
        "Working from home or taking enclosed electric transit minimizes both outdoor pollution exposure and road emissions, though indoor ventilation/filtration still matters."
      );
    }
  } else {
    sustainableAlternatives.push({
      title: "Choose walking, cycling, or public transit on lower-traffic streets",
      detail:
        "With low-to-moderate AQI, active travel and transit cut urban tailpipe emissions without elevated smog exposure.",
      priority: "recommended",
    });
    tradeOffs.push(
      "Choosing side streets over arterial roads slightly increases trip distance in exchange for lower near-roadway NO2 and ultrafine particle exposure."
    );
  }

  // 5. Safety notices & non-diagnostic boundary
  if (highSmog || isSensitive) {
    safetyNotices.push(
      reading.scale === "INDIA_CPCB"
        ? "For severe or worsening respiratory symptoms, consult a qualified clinician and follow official CPCB / Ministry of Health & Family Welfare advisories."
        : "For severe or worsening respiratory symptoms, consult a qualified clinician and follow official US EPA AirNow / CDC guidance."
    );
  }
  safetyNotices.push(
    "Informational guidance only: AirQ does not provide medical diagnoses or guarantee specific health or emissions savings."
  );

  assumptions.push(
    "N95/FFP2 effectiveness depends on proper fit and seal; loose masks provide substantially lower particulate filtration.",
    `Data attribution: ${reading.source} (${reading.observationType}, ${reading.uncertainty}).`
  );

  return PolicyRecommendationSchema.parse({
    effectiveRiskTier,
    headline,
    dailyRoutineActions,
    indoorAirGuidance,
    sustainableAlternatives,
    tradeOffs,
    safetyNotices,
    assumptions,
  });
}
