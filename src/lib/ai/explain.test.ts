import { afterEach, describe, expect, it, vi } from "vitest";
import { getDemoScenarioById } from "../fixtures/scenarios";
import { evaluateAirQualityPolicy } from "../policy/engine";
import { generateGroundedExplanation } from "./explain";

describe("generateGroundedExplanation", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("uses deterministic-fallback when GEMINI_API_KEY is unset", async () => {
    delete process.env.GEMINI_API_KEY;
    const scenario = getDemoScenarioById("delhi-winter-smog");
    const policy = evaluateAirQualityPolicy(scenario.defaultContext, scenario.reading);

    const res = await generateGroundedExplanation(
      scenario.defaultContext,
      scenario.reading,
      policy
    );

    expect(res.mode).toBe("deterministic-fallback");
    expect(res.explanation.headline).toContain("New Delhi");
  });

  it("falls back gracefully when upstream GenAI returns malformed JSON", async () => {
    process.env.GEMINI_API_KEY = "test-placeholder-key";
    const scenario = getDemoScenarioById("los-angeles-smoke");
    const policy = evaluateAirQualityPolicy(scenario.defaultContext, scenario.reading);

    const mockFetch = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: "{bad json" }] } }],
        }),
        { status: 200 }
      )
    );

    const res = await generateGroundedExplanation(
      scenario.defaultContext,
      scenario.reading,
      policy,
      mockFetch
    );

    expect(res.mode).toBe("deterministic-fallback");
    expect(res.explanation.whyItMatters).toContain("Los Angeles");
  });

  it("returns genai mode when Gemini returns valid schema-compliant JSON", async () => {
    process.env.GEMINI_API_KEY = "test-placeholder-key";
    const scenario = getDemoScenarioById("seattle-clean");
    const policy = evaluateAirQualityPolicy(scenario.defaultContext, scenario.reading);

    const mockFetch = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      headline: "Clean air in Seattle supports outdoor exercise.",
                      whyItMatters:
                        "US EPA AQI is 34 (Good), so outdoor activity poses low particulate risk.",
                      tradeOffSummary:
                        "Walking or cycling cuts tailpipe emissions while keeping exposure low.",
                      assumptionNote:
                        "Based on US EPA AQI thresholds and curated sample fixture data.",
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200 }
      )
    );

    const res = await generateGroundedExplanation(
      scenario.defaultContext,
      scenario.reading,
      policy,
      mockFetch
    );

    expect(res.mode).toBe("genai");
    expect(res.explanation.headline).toContain("Seattle");
  });
});
