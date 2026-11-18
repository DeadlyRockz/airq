import { NextResponse } from "next/server";
import { searchCities } from "@/lib/aqi/open-meteo";

/**
 * Handles GET /api/geocode?q=... requests to return city autocomplete suggestions
 * from Open-Meteo Geocoding.
 *
 * @param request - Incoming Next.js Request with query parameter `q`.
 * @returns JSON response containing `suggestions`.
 * @example
 * // GET /api/geocode?q=Thanjavur
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2 || q.length > 100) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await searchCities(q);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
