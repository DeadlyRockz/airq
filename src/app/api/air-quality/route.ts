import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchLiveAirQuality } from "@/lib/aqi/open-meteo";
import { UserContextSchema } from "@/lib/aqi/types";
import { getDemoScenarioById } from "@/lib/fixtures/scenarios";
import { parseJsonBody } from "@/lib/http/parse-json";
import { evaluateAirQualityPolicy } from "@/lib/policy/engine";

const AirQualityRequestSchema = z.object({
  mode: z.enum(["live", "demo"]).default("live"),
  scenarioId: z.string().optional(),
  context: UserContextSchema,
});

/**
 * Handles POST /api/air-quality requests for either no-key demo scenarios or live Open-Meteo lookups
 * with automatic fallback to labeled sample data if upstream fails.
 *
 * @param request - Incoming Next.js Request.
 * @returns JSON response containing reading, deterministic policy, and active mode.
 * @example
 * // POST /api/air-quality { mode: "demo", scenarioId: "delhi-winter-smog", context: { ... } }
 */
export async function POST(request: Request) {
  const jsonResult = await parseJsonBody(request);
  if (!jsonResult.ok) {
    return jsonResult.response;
  }

  const parsed = AirQualityRequestSchema.safeParse(jsonResult.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request parameters.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { mode, scenarioId, context } = parsed.data;

  if (mode === "demo") {
    const scenario = getDemoScenarioById(scenarioId ?? "delhi-winter-smog");
    const policy = evaluateAirQualityPolicy(context, scenario.reading);
    return NextResponse.json({
      mode: "demo" as const,
      reading: scenario.reading,
      policy,
    });
  }

  try {
    const reading = await fetchLiveAirQuality(
      context.locationLabel,
      context.preferredScale,
      context.coordinates
    );
    const policy = evaluateAirQualityPolicy(context, reading);
    return NextResponse.json({
      mode: "live" as const,
      reading,
      policy,
    });
  } catch (err) {
    const fallbackScenario = getDemoScenarioById(
      context.preferredScale === "INDIA_CPCB" ? "bengaluru-moderate" : "los-angeles-smoke"
    );
    const policy = evaluateAirQualityPolicy(context, fallbackScenario.reading);
    const reason = err instanceof Error ? err.message : "Live air quality service unavailable.";

    return NextResponse.json({
      mode: "fallback" as const,
      fallbackReason: `${reason} Showing labeled sample data instead.`,
      reading: fallbackScenario.reading,
      policy,
    });
  }
}
