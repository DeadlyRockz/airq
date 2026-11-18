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

const RISK_ORDER: readonly RiskTier[] = [
  "low",
  "moderate",
  "elevated",
  "high",
  "very_high",
  "severe",
];

function escalateRiskForSensitivity(baseTier: RiskTier, context: UserContext): RiskTier {
  const isSensitive =
    context.sensitivityGroup === "sensitive_respiratory" ||
    context.sensitivityGroup === "children_elderly";

  if (!isSensitive) {
    return baseTier;
  }

  const idx = RISK_ORDER.indexOf(baseTier);
  if (idx >= 0 && (baseTier === "moderate" || baseTier === "elevated")) {
    return RISK_ORDER[Math.min(idx + 1, RISK_ORDER.length - 1)] ?? baseTier;
  }
  return baseTier;
}

function isHighExposureRisk(tier: RiskTier): boolean {
  return tier === "high" || tier === "very_high" || tier === "severe";
}

function buildHeadline(effectiveRiskTier: RiskTier, reading: AqiReading): string {
  const scaleTag = reading.scale === "INDIA_CPCB" ? "CPCB" : "US EPA";
  if (isHighExposureRisk(effectiveRiskTier)) {
    return `Prioritize exposure reduction in ${reading.locationName} (${reading.category}, ${reading.value} on ${scaleTag} scale).`;
  }
  if (effectiveRiskTier === "elevated") {
    return `Moderate-to-elevated air quality in ${reading.locationName} (${reading.category}); adjust outdoor timing and exertion.`;
  }
  return `Air quality in ${reading.locationName} is ${reading.category} (${reading.value}); normal routines are generally suitable.`;
}

function buildDailyRoutineActions(
  effectiveRiskTier: RiskTier,
  context: UserContext
): PolicyAction[] {
  const highSmog = isHighExposureRisk(effectiveRiskTier);
  const isSensitive = context.sensitivityGroup !== "general";

  if (effectiveRiskTier === "severe" || effectiveRiskTier === "very_high") {
    return [
      {
        title: "Move strenuous activity indoors",
        detail:
          context.activityGoal === "outdoor_exercise"
            ? "Cancel or move outdoor running/cycling indoors to avoid high particulate/ozone inhalation."
            : "Avoid prolonged outdoor exertion and reschedule non-essential outdoor errands.",
        priority: "critical",
      },
      {
        title: "Use a well-fitted N95 / FFP2 respirator if going outside",
        detail:
          "Cloth or loose surgical masks do not seal against fine particulate matter (PM2.5). A tight facial seal is required for effective filtration.",
        priority: "critical",
      },
    ];
  }

  if (effectiveRiskTier === "high" || effectiveRiskTier === "elevated") {
    const actions: PolicyAction[] = [
      {
        title: "Reduce outdoor exertion intensity and duration",
        detail:
          context.activityGoal === "outdoor_exercise"
            ? "Switch to lower-intensity movement or an indoor workout; avoid peak traffic corridors."
            : "Shift outdoor errands to periods with lower traffic and lower ozone/particulate buildup.",
        priority: highSmog ? "critical" : "recommended",
      },
    ];
    if (isSensitive || highSmog) {
      actions.push({
        title: "Keep a well-fitted N95 / FFP2 mask available for street exposure",
        detail:
          "Especially helpful near busy roadways or during visible haze if outdoor travel cannot be avoided.",
        priority: "recommended",
      });
    }
    return actions;
  }

  return [
    {
      title: "Normal outdoor schedule is appropriate",
      detail:
        isSensitive && effectiveRiskTier === "moderate"
          ? "Air quality is acceptable, though unusually sensitive individuals should monitor symptoms during prolonged exertion."
          : "Conditions support regular outdoor exercise, errands, and active commuting.",
      priority: "optional",
    },
  ];
}

function buildIndoorGuidance(highSmog: boolean, context: UserContext): PolicyAction[] {
  const guidance: PolicyAction[] = [];

  if (context.indoorFuelSource !== "none_electric") {
    guidance.push({
      title: "Do NOT seal your home while burning fuel or cooking with gas",
      detail:
        "Unvented gas stoves, kerosene, or solid-fuel cooking/heating emit nitrogen dioxide (NO2) and carbon monoxide (CO). Keep kitchen exhaust fans running or crack a window for cross-ventilation during cooking, even when outdoor AQI is poor.",
      priority: "critical",
    });
  } else if (highSmog) {
    guidance.push({
      title: "Keep windows closed during peak outdoor smog",
      detail:
        "Since no indoor fuel-burning source is selected, closing windows helps limit outdoor PM2.5 infiltration during high-pollution hours.",
      priority: "recommended",
    });
  } else {
    guidance.push({
      title: "Use natural ventilation when outdoor air is clean",
      detail:
        "Opening windows during low-AQI hours helps clear indoor CO2 and household pollutants.",
      priority: "recommended",
    });
  }

  if (context.hasHepaPurifier) {
    guidance.push({
      title: "Run your HEPA air purifier continuously in the main occupied room",
      detail:
        "Keep doors to unused rooms closed so the purifier's clean air delivery rate (CADR) matches the room volume.",
      priority: highSmog ? "critical" : "optional",
    });
  } else if (highSmog) {
    guidance.push({
      title: "Consider a HEPA-filtered clean-air room",
      detail:
        "If an air purifier is unavailable, spend extended rest/sleep hours in an interior room away from street-facing drafts.",
      priority: "recommended",
    });
  }

  if (!context.hasIndoorSensor) {
    guidance.push({
      title: "Indoor air quality cannot be verified without sensors",
      detail:
        "Without an indoor PM2.5, CO2, or CO monitor, AirQ cannot measure actual indoor pollutant levels; rely on ventilation safety cues and source control.",
      priority: "recommended",
    });
  }

  return guidance;
}

function buildSustainableAlternatives(
  highSmog: boolean,
  context: UserContext
): { alternatives: PolicyAction[]; tradeOffs: string[] } {
  if (!highSmog) {
    return {
      alternatives: [
        {
          title: "Choose walking, cycling, or public transit on lower-traffic streets",
          detail:
            "With low-to-moderate AQI, active travel and transit cut urban tailpipe emissions without elevated smog exposure.",
          priority: "recommended",
        },
      ],
      tradeOffs: [
        "Choosing side streets over arterial roads slightly increases trip distance in exchange for lower near-roadway NO2 and ultrafine particle exposure.",
      ],
    };
  }

  if (context.commuteMode === "walk_cycle") {
    return {
      alternatives: [
        {
          title: "Temporarily pause unmasked walking or cycling commutes",
          detail:
            "During high smog, exposure safety takes priority over zero-emission outdoor travel. Use enclosed public transit, carpool with AC set to recirculate, or work remotely if available.",
          priority: "critical",
        },
      ],
      tradeOffs: [
        "Switching from cycling/walking to enclosed transit or carpooling increases per-trip transport emissions today, but protects against elevated inhaled PM2.5/O3 dose during physical exertion.",
      ],
    };
  }

  return {
    alternatives: [
      {
        title: "Prefer electric rail/metro or remote work over solo car trips",
        detail:
          "Enclosed electric transit or working from home reduces both personal outdoor exposure and per-passenger tailpipe emissions.",
        priority: "recommended",
      },
    ],
    tradeOffs: [
      "Working from home or taking enclosed electric transit minimizes both outdoor pollution exposure and road emissions, though indoor ventilation/filtration still matters.",
    ],
  };
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

  const { alternatives, tradeOffs } = buildSustainableAlternatives(highSmog, context);

  const safetyNotices: string[] = [];
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

  const assumptions = [
    `Category and risk thresholds strictly use ${
      reading.scale === "INDIA_CPCB" ? "India CPCB AQI (0–500)" : "US EPA AQI (0–500)"
    } without cross-scale conversion.`,
    "Respiratory dose increases during vigorous outdoor exertion because minute ventilation rises substantially compared to resting or seated travel.",
    "N95/FFP2 effectiveness depends on proper fit and seal; loose masks provide substantially lower particulate filtration.",
    `Data attribution: ${reading.source} (${reading.observationType}, ${reading.uncertainty}).`,
  ];

  return PolicyRecommendationSchema.parse({
    effectiveRiskTier,
    headline: buildHeadline(effectiveRiskTier, reading),
    dailyRoutineActions: buildDailyRoutineActions(effectiveRiskTier, context),
    indoorAirGuidance: buildIndoorGuidance(highSmog, context),
    sustainableAlternatives: alternatives,
    tradeOffs,
    safetyNotices,
    assumptions,
  });
}
