import "server-only";
import { z } from "zod";
import type { AqiReading, UserContext } from "../aqi/types";
import type { PolicyRecommendation } from "../policy/engine";

export const ExplanationSchema = z.object({
  headline: z.string().trim().min(5).max(200),
  whyItMatters: z.string().trim().min(10).max(600),
  tradeOffSummary: z.string().trim().min(10).max(500),
  assumptionNote: z.string().trim().min(10).max(400),
});

export type GroundedExplanation = z.infer<typeof ExplanationSchema>;

export type ExplanationResult = {
  mode: "genai" | "deterministic-fallback";
  explanation: GroundedExplanation;
};

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Builds a deterministic, policy-grounded explanation when no GenAI key is configured
 * or when an upstream model call fails or returns invalid output.
 *
 * @param context - Validated user context.
 * @param reading - Validated AQI reading.
 * @param policy - Deterministic policy recommendation.
 * @returns GroundedExplanation strictly derived from policy & reading.
 * @example
 * const exp = buildDeterministicExplanation(context, reading, policy);
 */
export function buildDeterministicExplanation(
  context: UserContext,
  reading: AqiReading,
  policy: PolicyRecommendation
): GroundedExplanation {
  const scaleLabel = reading.scale === "INDIA_CPCB" ? "India CPCB AQI" : "US EPA AQI";
  const topRoutine = policy.dailyRoutineActions[0]?.detail ?? policy.headline;
  const topIndoor = policy.indoorAirGuidance[0]?.detail ?? "";
  const topTradeOff =
    policy.tradeOffs[0] ??
    "Adjusting route and timing trades minor convenience for lower inhaled pollutant exposure.";

  return ExplanationSchema.parse({
    headline: policy.headline,
    whyItMatters:
      `${reading.locationName} is at ${reading.value} on the ${scaleLabel} scale (${reading.category}), driven primarily by ${reading.dominantPollutant}. For your ${context.activityGoal.replaceAll("_", " ")} plan, ${topRoutine} ${topIndoor}`.slice(
        0,
        580
      ),
    tradeOffSummary: topTradeOff.slice(0, 480),
    assumptionNote: (
      policy.assumptions[0] ??
      "Guidance uses deterministic scale-specific thresholds and avoids unverified health or CO2 savings claims."
    ).slice(0, 380),
  });
}

/**
 * Generates a grounded explanation via server-side Gemini API when GEMINI_API_KEY is set,
 * falling back deterministically whenever the key is absent or model output is invalid.
 *
 * @param context - Validated user context.
 * @param reading - Validated AQI reading.
 * @param policy - Server-computed deterministic policy recommendation.
 * @param fetchImpl - Optional fetch implementation for testing.
 * @returns ExplanationResult with active mode ("genai" or "deterministic-fallback").
 * @example
 * const res = await generateGroundedExplanation(context, reading, policy);
 */
export async function generateGroundedExplanation(
  context: UserContext,
  reading: AqiReading,
  policy: PolicyRecommendation,
  fetchImpl: typeof fetch = fetch
): Promise<ExplanationResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const fallback = buildDeterministicExplanation(context, reading, policy);

  if (!apiKey) {
    return { mode: "deterministic-fallback", explanation: fallback };
  }

  const groundedPayload = {
    locationName: reading.locationName,
    scale: reading.scale,
    aqiValue: reading.value,
    category: reading.category,
    dominantPollutant: reading.dominantPollutant,
    observationType: reading.observationType,
    isSampleData: reading.isSampleData,
    userGoal: context.activityGoal,
    commuteMode: context.commuteMode,
    sensitivityGroup: context.sensitivityGroup,
    indoorFuelSource: context.indoorFuelSource,
    policyHeadline: policy.headline,
    routineActions: policy.dailyRoutineActions.map((a) => a.title),
    indoorGuidance: policy.indoorAirGuidance.map((a) => a.title),
    tradeOffs: policy.tradeOffs,
    assumptions: policy.assumptions,
  };

  const systemInstruction = [
    "You are AirQ, an urban air quality assistant.",
    "Summarize the provided deterministic policy JSON in clear, calm, plain language.",
    "STRICT RULES:",
    "1. Never invent AQI numbers, health improvement percentages, or CO2 savings.",
    "2. Never provide medical diagnoses or clinical promises.",
    "3. Never contradict the indoor ventilation/CO safety rule or exposure-safety-first rule.",
    "4. Return ONLY valid JSON matching: { headline, whyItMatters, tradeOffSummary, assumptionNote }.",
  ].join("\n");

  try {
    const res = await fetchImpl(GEMINI_ENDPOINT, {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify(groundedPayload) }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!res.ok) {
      return { mode: "deterministic-fallback", explanation: fallback };
    }

    const raw = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return { mode: "deterministic-fallback", explanation: fallback };
    }

    const parsed = ExplanationSchema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      return { mode: "deterministic-fallback", explanation: fallback };
    }

    return { mode: "genai", explanation: parsed.data };
  } catch {
    return { mode: "deterministic-fallback", explanation: fallback };
  }
}
