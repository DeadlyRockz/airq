import { describe, expect, it } from "vitest";
import { getDemoScenarioById } from "@/lib/fixtures/scenarios";
import { POST } from "./route";

describe("POST /api/explain", () => {
  it("returns 400 on invalid JSON", async () => {
    const req = new Request("http://localhost/api/explain", {
      method: "POST",
      body: "{bad json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid payload schema", async () => {
    const req = new Request("http://localhost/api/explain", {
      method: "POST",
      body: JSON.stringify({ context: {} }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns a grounded explanation for valid context and reading", async () => {
    const scenario = getDemoScenarioById("delhi-winter-smog");
    const req = new Request("http://localhost/api/explain", {
      method: "POST",
      body: JSON.stringify({
        context: scenario.defaultContext,
        reading: scenario.reading,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(["genai", "deterministic-fallback"]).toContain(data.mode);
    expect(data.explanation.headline).toContain("New Delhi");
  });
});

