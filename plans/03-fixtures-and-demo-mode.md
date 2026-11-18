# Phase 03 - Deterministic Fixtures & No-Key Demo Mode

**Depends on:** Phase 02. **Blocks:** Phase 06.
**Deliverable:** Curated, openly labeled sample AQI + lifestyle scenarios (`src/lib/fixtures/scenarios.ts`) proving personalized, variable recommendations with zero API keys.
**Status:** done 2026-11-18

> Prerequisites: read `AGENT.md`, `plans/README.md`, `plans/02-aqi-model-and-safety-policy.md`. Implement this phase only.

## 1. Goal

Provide a rock-solid no-key demo mode so any judge or user can immediately test AirQ across contrasting cities, AQI scales (US vs CPCB), and user profiles, seeing distinct, safety-aware recommendations with transparent sample-data labeling.

## 2. Scope

**In:**
- `src/lib/fixtures/scenarios.ts`: 4–5 realistic, Zod-validated demo presets:
  1. **Delhi (Winter Smog - India/CPCB AQI ~380, Very Poor/Severe)**
  2. **Bengaluru (Moderate - India/CPCB AQI ~115, Moderately Polluted)**
  3. **Los Angeles (Wildfire/Ozone - US AQI ~165, Unhealthy)**
  4. **Seattle (Clean Air - US AQI ~35, Good)**
- Preset lifestyle profiles (e.g., Daily Cyclist, Asthmatic/Sensitive Adult, Family with Gas Stove, Office Commuter).
- Unit tests verifying every preset validates against `AqiReadingSchema` and produces distinct policy outputs when context changes.

**Out (deferred):**
- Live API fetching → `plans/04-live-data-and-fallback.md`
- UI rendering → `plans/06-ui-and-user-journey.md`

## 3. Steps

### 03.1 - Curate & Validate Demo Scenarios
- Create `DEMO_SCENARIOS` with explicit `isSampleData: true`, `source: "AirQ Curated Sample Dataset"`, `observationType`, `timestamp`, and `uncertainty` strings.
- Write `src/lib/fixtures/scenarios.test.ts` validating all fixtures with Zod and asserting that changing user context (e.g., cyclist vs indoor worker, gas stove vs electric) changes recommendations deterministically.
- **Verify:** `pnpm test src/lib/fixtures`

## 4. Verification checklist

```bash
pnpm lint && pnpm typecheck && pnpm test
```

- [ ] Every demo scenario passes `AqiReadingSchema.parse`
- [ ] Both US AQI and India/CPCB AQI scales are represented accurately
- [ ] Tests prove recommendations vary meaningfully by user context and AQI severity
- [ ] All fixtures carry `isSampleData: true` and explicit uncertainty notes

## 5. Anti-pattern guards

- **MUST NOT** label sample data as live observations.
- **MUST NOT** hardcode UI strings inside fixture data; keep fixtures pure data.

## 6. Exit criteria

Phase 03 is complete when fixture tests pass and `plans/README.md` is updated.

