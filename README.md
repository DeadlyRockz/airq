# AirQ - Challenge 6: Urban Air Quality Assistant

**Challenge Vertical:** Challenge 6 - Urban Air Quality & Sustainable Daily Decisions

AirQ is a safety-aware, location- and lifestyle-personalized urban air quality assistant built with **Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Zod, and Vitest**. It turns raw air quality readings into deterministic, safety-first daily routine adjustments, indoor air precautions, sustainable travel trade-offs, and grounded explanations-working **out of the box with zero API keys** via curated demo scenarios and no-key Open-Meteo lookups.

## Architecture & Logic

```
User Context (location, AQI scale, sensitivity, commute, indoor fuel, sensors)
   │
   ▼
Data Layer (Demo Fixtures OR Server-Side Open-Meteo Adapter + TTL Cache + Fallback)
   │  └─ Strict US EPA AQI vs India/CPCB AQI separation (never conflates us_aqi with CPCB)
   ▼
Deterministic Safety Policy Engine (src/lib/policy/engine.ts)
   │  ├─ Prioritizes exposure safety over low-carbon outdoor travel during high smog
   │  ├─ Enforces CO/NO2 ventilation guard when gas/solid fuel is used indoors
   │  ├─ States indoor air cannot be verified without indoor sensors
   │  └─ Attaches documented assumptions & non-diagnostic safety notices
   ▼
Grounded Explanation Layer (src/lib/ai/explain.ts)
   └─ Optional server-side Gemini API constrained to policy JSON, with deterministic fallback
```

## Key Safety & Scientific Principles

- **US EPA vs. India/CPCB AQI Separation:** `classifyUsAqi` and `classifyCpcbAqi` use their own official category thresholds. When `INDIA_CPCB` is selected in live mode, AirQ derives an estimated CPCB sub-index from modeled pollutants (`PM2.5`, `PM10`, `NO2`, `O3`) and labels it explicitly as an hourly modeled estimate-never relabeling Open-Meteo `us_aqi` as CPCB AQI.
- **Exposure Safety First:** During `high`, `very_high`, or `severe` AQI, AirQ recommends pausing unmasked walking or cycling commutes in favor of enclosed transit or remote work, and explains the emissions-vs-exposure trade-off.
- **Indoor Fuel & CO Guard:** If unvented gas cooking or solid fuel is selected, AirQ never advises sealing all windows; it instructs maintaining exhaust/cross-ventilation to avoid CO and NO2 buildup.
- **No Unverified Claims:** AirQ never invents quantitative health improvement percentages or CO2 savings, and does not provide medical diagnoses.

## Local Setup

### Prerequisites
- Node.js `>= 20.9.0` (tested on Node `24.12.0`)
- `pnpm` `10.x` (`packageManager: pnpm@10.28.1`)

### Install & Run (No API Key Required)
```bash
pnpm install
cp .env.example .env.local   # optional; GEMINI_API_KEY can remain blank
pnpm dev
```
Open `http://localhost:3000`.

### Optional GenAI Explanations
Set `GEMINI_API_KEY` in `.env.local` (server-side only; never commit `.env.local` or prefix with `NEXT_PUBLIC_`). When omitted, `/api/explain` automatically uses `buildDeterministicExplanation`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start Next.js development server |
| `pnpm lint` | Run ESLint (`--max-warnings 0`) |
| `pnpm typecheck` | Run TypeScript (`tsc --noEmit`) |
| `pnpm test` | Run Vitest unit and component tests |
| `pnpm build` | Build production Next.js bundle |
| `pnpm format:check` | Check Prettier formatting |

## Data Sources & Known Limits

- **Curated Sample Dataset:** Built-in fixtures for New Delhi, Bengaluru, Los Angeles, and Seattle (`isSampleData: true`).
- **Live Data (No-Key):** [Open-Meteo Geocoding & Air Quality API](https://open-meteo.com/en/docs/air-quality-api) (CAMS/NOAA modeled regional grid, ~11–40 km resolution). Modeled hourly concentrations can differ from official 24-hour ground-station monitors and street-level micro-environments.
- **Indoor Air Limit:** Without physical indoor PM2.5/CO2/CO sensors, indoor air quality cannot be directly measured.

## Demo Walkthrough

1. Launch `pnpm dev` and open `http://localhost:3000`.
2. In **No-Key Demo** mode, switch between **Delhi - Winter Smog (CPCB 365)** and **Seattle - Clean Marine Air (US EPA 34)** to see risk tiers, routine changes, and trade-offs adapt immediately.
3. Toggle **Indoor Cooking / Fuel Source** between *Electric* and *Gas Stove* on the Delhi scenario to verify the CO/ventilation safety guard.
4. Switch to **Live City**, enter a city (e.g. `Bengaluru` or `London`), and click **Fetch Live Air Quality** to test live Open-Meteo attribution (or automatic fallback if offline).

