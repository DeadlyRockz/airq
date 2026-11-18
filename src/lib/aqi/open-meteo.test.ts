import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAirQualityCache, fetchLiveAirQuality, searchCities } from "./open-meteo";

describe("fetchLiveAirQuality", () => {
  beforeEach(() => {
    clearAirQualityCache();
  });

  it("maps US_EPA requests to Open-Meteo us_aqi with modeled attribution", async () => {
    const mockFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                name: "Seattle",
                country: "United States",
                latitude: 47.6,
                longitude: -122.3,
              },
            ],
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            current: {
              time: "2026-11-18T12:00",
              us_aqi: 42,
              pm2_5: 9.1,
              pm10: 15.0,
              nitrogen_dioxide: 14.2,
              ozone: 40.0,
            },
          }),
          { status: 200 }
        )
      );

    const reading = await fetchLiveAirQuality("Seattle", "US_EPA", undefined, mockFetch);

    expect(reading.scale).toBe("US_EPA");
    expect(reading.value).toBe(42);
    expect(reading.category).toBe("Good");
    expect(reading.isSampleData).toBe(false);
    expect(reading.observationType).toBe("modeled_estimate");
  });

  it("derives INDIA_CPCB from raw pollutants instead of copying us_aqi", async () => {
    const mockFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                name: "Delhi",
                country: "India",
                latitude: 28.61,
                longitude: 77.21,
              },
            ],
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            current: {
              time: "2026-11-18T12:00",
              us_aqi: 180,
              pm2_5: 120,
              pm10: 210,
              nitrogen_dioxide: 55,
              ozone: 30,
            },
          }),
          { status: 200 }
        )
      );

    const reading = await fetchLiveAirQuality("Delhi", "INDIA_CPCB", undefined, mockFetch);

    expect(reading.scale).toBe("INDIA_CPCB");
    expect(reading.value).toBe(300);
    expect(reading.category).toBe("Poor");
    expect(reading.source).toContain("CPCB Sub-Index Estimate");
  });

  it("fetches directly by coordinates without calling geocoding", async () => {
    const mockFetch = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          current: {
            time: "2026-11-18T12:00",
            us_aqi: 55,
            pm2_5: 14.0,
            pm10: 22.0,
            nitrogen_dioxide: 18.0,
            ozone: 45.0,
          },
        }),
        { status: 200 }
      )
    );

    const reading = await fetchLiveAirQuality(
      "Current Location",
      "US_EPA",
      { latitude: 10.787, longitude: 79.1378 },
      mockFetch
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(reading.locationName).toBe("Current Location");
    expect(reading.value).toBe(55);
  });

  it("throws when geocoding returns no results", async () => {
    const mockFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [] }), { status: 200 }));

    await expect(
      fetchLiveAirQuality("NonexistentCityXYZ", "US_EPA", undefined, mockFetch)
    ).rejects.toThrow("was not found");
  });

  it("returns formatted city suggestions from searchCities", async () => {
    const mockFetch = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          results: [
            {
              name: "Thanjavur",
              admin1: "Tamil Nadu",
              country: "India",
              latitude: 10.787,
              longitude: 79.1378,
            },
          ],
        }),
        { status: 200 }
      )
    );

    const suggestions = await searchCities("Thanjavur", mockFetch);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.label).toBe("Thanjavur, Tamil Nadu, India");
  });
});
