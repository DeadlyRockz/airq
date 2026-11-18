import { describe, expect, it, vi } from "vitest";
import * as openMeteo from "@/lib/aqi/open-meteo";
import { GET } from "./route";

describe("GET /api/geocode", () => {
  it("returns empty suggestions for queries shorter than 2 characters", async () => {
    const req = new Request("http://localhost/api/geocode?q=a");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.suggestions).toEqual([]);
  });

  it("returns matching city suggestions", async () => {
    vi.spyOn(openMeteo, "searchCities").mockResolvedValueOnce([
      { label: "Thanjavur, Tamil Nadu, India", latitude: 10.78, longitude: 79.13 },
    ]);

    const req = new Request("http://localhost/api/geocode?q=Thanjavur");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.suggestions).toHaveLength(1);
    expect(data.suggestions[0]?.label).toBe("Thanjavur, Tamil Nadu, India");
  });

  it("returns empty suggestions gracefully when upstream fails", async () => {
    vi.spyOn(openMeteo, "searchCities").mockRejectedValueOnce(new Error("Network error"));

    const req = new Request("http://localhost/api/geocode?q=London");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.suggestions).toEqual([]);
  });
});

