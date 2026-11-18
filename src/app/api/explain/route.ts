import { NextResponse } from "next/server";
import { z } from "zod";
import { generateGroundedExplanation } from "@/lib/ai/explain";
import { AqiReadingSchema, UserContextSchema } from "@/lib/aqi/types";
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = ExplainRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid explanation request payload." }, { status: 400 });
  }

  const { context, reading } = parsed.data;
  const policy = evaluateAirQualityPolicy(context, reading);
  const result = await generateGroundedExplanation(context, reading, policy);

  return NextResponse.json(result);
}
