# Phase 04 - Live AQI Data, Attribution & Fallback

**Depends on:** Phase 02, Phase 03. **Blocks:** Phase 06.
**Deliverable:** Server-side AQI route handler (`src/app/api/air-quality/route.ts`) and Open-Meteo adapter (`src/lib/aqi/open-meteo.ts`) with Zod validation, caching, attribution, and automatic fallback to demo/cached data.
**Status:** done 2026-11-18

> Prerequisites: read `AGENT.md`, `plans/README.md`, `docs/allowed-apis.md`. Implement this phase only.

## 1. Goal

Fetch real-time urban air quality data safely on the server (no-key Open-Meteo Geocoding + Air Quality API), preserve strict US vs CPCB scale separation, cache responses to stay efficient, and fall back gracefully to labeled demo data if upstream APIs fail or time out.

## 2. Scope

**In:**
- `src/lib/aqi/open-meteo.ts`: Server-side adapter for Open-Meteo Geocoding and Air Quality API (`us_aqi`, `pm2_5`, `pm10`, `nitrogen_dioxide`, `ozone`, `european_aqi`), with `AbortSignal.timeout`, Zod response validation, and Next.js `revalidate` / in-memory TTL cache.
- Optional CPCB sub-index derivation from raw Open-Meteo `pm2_5` / `pm10` / `no2` / `o3` when user selects India/CPCB scale - explicitly labeled as *estimated from Open-Meteo modeled pollutants, not official CPCB station data*.
- `src/app/api/air-quality/route.ts`: `POST` / `GET` handler validating coordinates/city query with Zod, restricting outbound hosts (no arbitrary URL fetching / SSRF), returning `{ reading, policy, mode: "live" | "fallback" }`.
- Unit tests with mocked `fetch` covering live success, upstream 500/timeout fallback, and invalid input rejection (400).

**Out (deferred):**
- GenAI explanation generation → `plans/05-grounded-genai.md`
- UI integration → `plans/06-ui-and-user-journey.md`

## 3. Steps

### 04.1 - Open-Meteo Server Adapter & CPCB Labeling
- Implement geocoding + air-quality fetch with strict Zod validation and 5s timeout.
- Ensure `us_aqi` is never relabeled as CPCB AQI.
- **Verify:** `pnpm test src/lib/aqi/open-meteo.test.ts`

### 04.2 - `/api/air-quality` Route Handler & Fallback
- Validate request body/params with Zod; return 400 on malformed input.
- Cache by rounded coordinates/city (e.g., 10-minute TTL).
- On upstream failure, return closest matching demo scenario with `mode: "fallback"` and clear fallback notice.
- **Verify:** `pnpm test src/app/api/air-quality`

## 4. Verification checklist

```bash
pnpm lint && pnpm typecheck && pnpm test
```

- [ ] Outbound requests are restricted to allowlisted Open-Meteo endpoints only (no SSRF)
- [ ] Upstream errors/timeouts fall back cleanly without exposing stack traces
- [ ] Response includes `source`, `unit`, `timestamp`, `observationType`, and `uncertainty`
- [ ] `us_aqi` is strictly separated from India/CPCB AQI

## 5. Anti-pattern guards

- **MUST NOT** call Open-Meteo or any external API directly from client components if server route is the boundary.
- **MUST NOT** expose internal error stacks or raw upstream payloads to the client.
- **MUST NOT** treat modeled/forecast hourly values as ground-station observations without labeling.

## 6. Exit criteria

Phase 04 is complete when adapter and route tests pass and `plans/README.md` is updated.

