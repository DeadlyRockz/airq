import "server-only";
import { z } from "zod";
import { classifyCpcbAqi, classifyUsAqi, deriveCpcbFromPollutants } from "./scales";
import {
  AqiReadingSchema,
  type AqiReading,
  type AqiScale,
  type Coordinates,
  type DominantPollutant,
  type Pollutants,
} from "./types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const CACHE_TTL_MS = 10 * 60 * 1000;

const GeocodingResponseSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        admin1: z.string().optional(),
        country: z.string().optional(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .optional(),
});

export const CitySuggestionSchema = z.object({
  label: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});
export type CitySuggestion = z.infer<typeof CitySuggestionSchema>;

const AirQualityResponseSchema = z.object({
  current: z.object({
    time: z.string(),
    us_aqi: z.number().nullable().optional(),
    pm10: z.number().nullable().optional(),
    pm2_5: z.number().nullable().optional(),
    nitrogen_dioxide: z.number().nullable().optional(),
    ozone: z.number().nullable().optional(),
  }),
});

type CacheEntry = {
  reading: AqiReading;
  expiresAt: number;
};

const responseCache = new Map<string, CacheEntry>();

function inferDominantFromPollutants(pollutants: Pollutants): DominantPollutant {
  if (typeof pollutants.pm2_5 === "number" && pollutants.pm2_5 >= 25) return "PM2.5";
  if (typeof pollutants.pm10 === "number" && pollutants.pm10 >= 50) return "PM10";
  if (typeof pollutants.o3 === "number" && pollutants.o3 >= 100) return "O3";
  if (typeof pollutants.no2 === "number" && pollutants.no2 >= 40) return "NO2";
  return "Composite";
}

/**
 * Searches Open-Meteo Geocoding for matching city suggestions.
 *
 * @param query - Partial city name (minimum 2 characters).
 * @param fetchImpl - Optional fetch implementation for testing.
 * @returns Array of up to 5 city suggestions with coordinates.
 * @example
 * const results = await searchCities("Thanjavur");
 */
export async function searchCities(
  query: string,
  fetchImpl: typeof fetch = fetch
): Promise<CitySuggestion[]> {
  const trimmed = query.trim();
  const primaryName = trimmed.includes(",") ? trimmed.split(",")[0]?.trim() || trimmed : trimmed;

  if (primaryName.length < 2) {
    return [];
  }

  const geoUrl = new URL(GEOCODING_URL);
  geoUrl.searchParams.set("name", primaryName);
  geoUrl.searchParams.set("count", "5");
  geoUrl.searchParams.set("language", "en");
  geoUrl.searchParams.set("format", "json");

  const geoRes = await fetchImpl(geoUrl.toString(), {
    signal: AbortSignal.timeout(5000),
    headers: { Accept: "application/json" },
  });
  if (!geoRes.ok) {
    return [];
  }

  const geoJson = GeocodingResponseSchema.parse(await geoRes.json());
  return (geoJson.results ?? []).map((place) => {
    const parts = [place.name, place.admin1, place.country].filter(Boolean);
    return {
      label: parts.join(", "),
      latitude: place.latitude,
      longitude: place.longitude,
    };
  });
}

/**
 * Fetches live modeled air quality data from Open-Meteo for a city query or exact
 * coordinates and maps it to either US EPA AQI or an explicitly labeled India CPCB estimate.
 *
 * @param cityQuery - User-entered city or location label.
 * @param scale - Requested AQI scale ("US_EPA" or "INDIA_CPCB").
 * @param coords - Optional exact coordinates (e.g. from browser geolocation or city suggestion).
 * @param fetchImpl - Optional fetch implementation for deterministic testing.
 * @returns Validated AqiReading with source, unit, timestamp, and uncertainty.
 * @throws Error when geocoding finds no match or upstream requests fail.
 * @example
 * const reading = await fetchLiveAirQuality("Bengaluru", "INDIA_CPCB");
 */
export async function fetchLiveAirQuality(
  cityQuery: string,
  scale: AqiScale,
  coords?: Coordinates,
  fetchImpl: typeof fetch = fetch
): Promise<AqiReading> {
  const trimmedQuery = cityQuery.trim();
  const cacheKey = coords
    ? `${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}:${scale}`
    : `${trimmedQuery.toLowerCase()}:${scale}`;

  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.reading;
  }

  let latitude: number;
  let longitude: number;
  let locationName: string;
  let country: string | undefined;

  if (coords) {
    latitude = coords.latitude;
    longitude = coords.longitude;
    locationName = trimmedQuery || `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
  } else {
    const primaryName = trimmedQuery.includes(",")
      ? trimmedQuery.split(",")[0]?.trim() || trimmedQuery
      : trimmedQuery;

    const geoUrl = new URL(GEOCODING_URL);
    geoUrl.searchParams.set("name", primaryName);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");

    const geoRes = await fetchImpl(geoUrl.toString(), {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });
    if (!geoRes.ok) {
      throw new Error(`Geocoding request failed with status ${geoRes.status}`);
    }

    const geoJson = GeocodingResponseSchema.parse(await geoRes.json());
    const place = geoJson.results?.[0];
    if (!place) {
      throw new Error(`Location "${trimmedQuery}" was not found`);
    }
    latitude = place.latitude;
    longitude = place.longitude;
    country = place.country;
    locationName = place.country ? `${place.name}, ${place.country}` : place.name;
  }

  const aqUrl = new URL(AIR_QUALITY_URL);
  aqUrl.searchParams.set("latitude", String(latitude));
  aqUrl.searchParams.set("longitude", String(longitude));
  aqUrl.searchParams.set("current", "us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone");
  aqUrl.searchParams.set("timezone", "UTC");

  const aqRes = await fetchImpl(aqUrl.toString(), {
    signal: AbortSignal.timeout(5000),
    headers: { Accept: "application/json" },
  });
  if (!aqRes.ok) {
    throw new Error(`Air quality request failed with status ${aqRes.status}`);
  }

  const aqJson = AirQualityResponseSchema.parse(await aqRes.json());
  const current = aqJson.current;

  const pollutants: Pollutants = {
    pm2_5: typeof current.pm2_5 === "number" ? current.pm2_5 : undefined,
    pm10: typeof current.pm10 === "number" ? current.pm10 : undefined,
    no2: typeof current.nitrogen_dioxide === "number" ? current.nitrogen_dioxide : undefined,
    o3: typeof current.ozone === "number" ? current.ozone : undefined,
  };

  let reading: AqiReading;

  if (scale === "INDIA_CPCB") {
    const derived = deriveCpcbFromPollutants(pollutants);
    if (!derived) {
      throw new Error("Upstream response lacked pollutant concentrations for CPCB derivation");
    }
    const cls = classifyCpcbAqi(derived.value);
    reading = AqiReadingSchema.parse({
      locationName,
      country,
      latitude,
      longitude,
      scale: cls.scale,
      value: cls.value,
      category: cls.category,
      riskTier: cls.riskTier,
      dominantPollutant: derived.dominantPollutant,
      pollutants,
      source: "Open-Meteo Modeled Pollutants (CPCB Sub-Index Estimate)",
      unit: cls.unit,
      timestamp: current.time,
      observationType: "modeled_estimate",
      uncertainty:
        "Estimated from hourly modeled PM2.5/PM10/NO2/O3 rather than official 24-hour CPCB ground-station monitors; local street levels may differ.",
      isSampleData: false,
    });
  } else {
    const usValue = current.us_aqi;
    if (typeof usValue !== "number") {
      throw new Error("Upstream response lacked us_aqi value");
    }
    const cls = classifyUsAqi(usValue);
    reading = AqiReadingSchema.parse({
      locationName,
      country,
      latitude,
      longitude,
      scale: cls.scale,
      value: cls.value,
      category: cls.category,
      riskTier: cls.riskTier,
      dominantPollutant: inferDominantFromPollutants(pollutants),
      pollutants,
      source: "Open-Meteo Air Quality API (CAMS/NOAA Modeled)",
      unit: cls.unit,
      timestamp: current.time,
      observationType: "modeled_estimate",
      uncertainty:
        "Modeled regional grid estimate (~11–40 km resolution); roadside micro-environments may be higher.",
      isSampleData: false,
    });
  }

  responseCache.set(cacheKey, {
    reading,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return reading;
}

/**
 * Clears the in-memory Open-Meteo cache (primarily for unit tests).
 *
 * @example
 * clearAirQualityCache();
 */
export function clearAirQualityCache(): void {
  responseCache.clear();
}
