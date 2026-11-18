import { NextResponse } from "next/server";
import { z } from "zod";
import { generateGroundedExplanation } from "@/lib/ai/explain";
import { AqiReadingSchema, UserContextSchema } from "@/lib/aqi/types";
import { parseJsonBody } from "@/lib/http/parse-json";
import { evaluateAirQualityPolicy } from "@/lib/policy/engine";

const ExplainRequestSchema = z.object({
  context: UserContextSchema,
  reading: AqiReadingSchema,
});

/**
 * Handles POST /api/explain by recomputing deterministic policy server-side and returning
 * a grounded GenAI explanation (or deterministic fallback when no API key is present).
 *
 * @param request - Incoming Next.js Request.
 * @returns JSON response with explanation and active mode.
 * @example
 * // POST /api/explain { context, reading }
 */
export async function POST(request: Request) {
  const jsonResult = await parseJsonBody(request);
  if (!jsonResult.ok) {
    return jsonResult.response;
  }

  const parsed = ExplainRequestSchema.safeParse(jsonResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid explanation request payload." }, { status: 400 });
  }

  const { context, reading } = parsed.data;
  const policy = evaluateAirQualityPolicy(context, reading);
  const result = await generateGroundedExplanation(context, reading, policy);

  return NextResponse.json(result);
}
