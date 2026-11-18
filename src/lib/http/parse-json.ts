import { NextResponse } from "next/server";

type ParseJsonResult = { ok: true; data: unknown } | { ok: false; response: NextResponse };

/**
 * Safely parses a JSON request body and returns a uniform 400 NextResponse on failure.
 *
 * @param request - Incoming Request object.
 * @returns Discriminated union containing parsed JSON or an error NextResponse.
 * @example
 * const parsed = await parseJsonBody(request);
 * if (!parsed.ok) return parsed.response;
 */
export async function parseJsonBody(request: Request): Promise<ParseJsonResult> {
  try {
    const data: unknown = await request.json();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 }),
    };
  }
}
