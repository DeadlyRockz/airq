import { describe, expect, it, vi } from "vitest";
import * as openMeteo from "@/lib/aqi/open-meteo";
import { POST } from "./route";

const validContext = {
  locationLabel: "Delhi",
  preferredScale: "INDIA_CPCB" as const,
  sensitivityGroup: "general" as const,
  commuteMode: "walk_cycle" as const,
  activityGoal: "commute" as const,
  indoorFuelSource: "none_electric" as const,
  hasHepaPurifier: false,
  hasIndoorSensor: false,
};

describe("POST /api/air-quality", () => {
  it("returns 400 on invalid input", async () => {
    const req = new Request("http://localhost/api/air-quality", {
      method: "POST",
      body: JSON.stringify({ mode: "demo" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns labeled sample data in demo mode", async () => {
    const req = new Request("http://localhost/api/air-quality", {
      method: "POST",
      body: JSON.stringify({
        mode: "demo",
        scenarioId: "delhi-winter-smog",
        context: validContext,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.mode).toBe("demo");
    expect(data.reading.isSampleData).toBe(true);
    expect(data.policy.effectiveRiskTier).toBe("very_high");
  });

  it("falls back to labeled sample data when live upstream fails", async () => {
    vi.spyOn(openMeteo, "fetchLiveAirQuality").mockRejectedValueOnce(new Error("Upstream timeout"));

    const req = new Request("http://localhost/api/air-quality", {
      method: "POST",
      body: JSON.stringify({
        mode: "live",
        context: validContext,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.mode).toBe("fallback");
    expect(data.fallbackReason).toContain("Upstream timeout");
    expect(data.reading.isSampleData).toBe(true);
  });
});
