# Phase 02 - Typed AQI/Source Model & Deterministic Safety Policy

**Depends on:** Phase 01. **Blocks:** Phase 03, Phase 04, Phase 05.
**Deliverable:** Pure TypeScript + Zod domain layer (`src/lib/aqi/` and `src/lib/policy/`) with separate US AQI and India/CPCB AQI scales, safety-first recommendation engine, and Vitest unit tests.
**Status:** done 2026-11-18

> Prerequisites: read `AGENT.md`, `plans/README.md`, `docs/allowed-apis.md`. Implement this phase only.

## 1. Goal

Build the deterministic core of AirQ: strict Zod schemas for user lifestyle/location context and AQI readings, unambiguous separation between US AQI (EPA) and India/CPCB AQI thresholds, and a pure policy engine that outputs safe daily routine changes, indoor air advice, sustainable alternatives, trade-offs, and documented assumptions.

## 2. Scope

**In:**
- `src/lib/aqi/types.ts` & `src/lib/aqi/scales.ts`: Zod schemas and category tables for **US AQI** (Good/Moderate/USG/Unhealthy/Very Unhealthy/Hazardous) and **India/CPCB AQI** (Good/Satisfactory/Moderately Polluted/Poor/Very Poor/Severe), plus CPCB sub-index calculation from raw pollutants (`pm2_5`, `pm10`, `no2`, `o3`) with explicit labeling.
- `src/lib/aqi/attribution.ts`: Source, unit, timestamp, observation vs forecast, and uncertainty metadata types.
- `src/lib/policy/engine.ts`: Pure `evaluateAirQualityPolicy(context, reading)` function:
  - Prioritizes exposure safety over low-carbon outdoor travel during high smog.
  - Enforces CO / fuel-burning ventilation guard (never advise sealing a home if indoor fuel-burning/gas cooking is present; state that indoor conditions cannot be known without sensors).
  - Avoids medical diagnosis or clinical promises; provides official guidance pointers for severe risk.
  - Attaches documented assumptions for any numeric estimate (never inventing health/CO2 savings).
- `src/lib/policy/engine.test.ts` & `src/lib/aqi/scales.test.ts`: Vitest unit tests for boundary values, US vs CPCB separation, and every safety guard.

**Out (deferred):**
- Sample demo scenarios → `plans/03-fixtures-and-demo-mode.md`
- Live HTTP fetching → `plans/04-live-data-and-fallback.md`

## 3. Steps

### 02.1 - AQI Scales, Attribution & Context Schemas
- Define `UserContextSchema` (location, scale preference, sensitivity group, primary activity/commute, indoor fuel-burning/ventilation context, air purifier availability).
- Define `AqiReadingSchema` (scale, value, category, dominant pollutant, pollutants, source name, unit, timestamp ISO, observationType: `observation | forecast`, uncertainty note, isSampleData).
- Implement `classifyUsAqi(value)` and `classifyCpcbAqi(value)` as separate, non-interchangeable functions.
- **Verify:** `pnpm test src/lib/aqi`

### 02.2 - Deterministic Safety-Aware Policy Engine
- Implement `evaluateAirQualityPolicy(context, reading)` returning structured `PolicyRecommendation`:
  - `riskLevel`, `summary`, `dailyRoutineActions[]`, `indoorAirGuidance[]`, `sustainableAlternatives[]`, `tradeOffs[]`, `safetyNotices[]`, `assumptions[]`.
- Enforce: high smog + cycling/walking -> recommend exposure-safe alternative (transit/reschedule/N95) and explain trade-off; indoor fuel-burning -> warn against sealing without ventilation; severe risk -> official health agency guidance without medical diagnosis.
- **Verify:** `pnpm test src/lib/policy`

## 4. Verification checklist

```bash
pnpm lint && pnpm typecheck && pnpm test
```

- [ ] US AQI and CPCB AQI thresholds are tested at every boundary and never mixed
- [ ] High-smog + outdoor low-carbon commute prioritizes exposure safety over low-carbon outdoor travel
- [ ] Indoor fuel-burning/gas-cooking context prevents "seal all windows" advice and notes sensor limitation
- [ ] Zero medical diagnosis or ungrounded numeric health/CO2 claims
- [ ] All exported functions have TSDoc headers

## 5. Anti-pattern guards

- **MUST NOT** map Open-Meteo `us_aqi` directly to CPCB categories.
- **MUST NOT** invent quantitative health improvement or CO2 savings numbers without explicit, cited assumptions.
- **MUST NOT** import `fetch`, `process.env`, or React inside `src/lib/policy/` (keep it pure and deterministic).

## 6. Exit criteria

Phase 02 is complete when all unit tests pass, `pnpm lint && pnpm typecheck` are green, and `plans/README.md` is updated.

