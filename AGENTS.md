# AGENTS.md - AirQ (Challenge 6: Urban Air Quality Assistant)

Entry point for contributors and AI agents working on **AirQ**. Read [AGENT.md](AGENT.md), [plans/README.md](plans/README.md), and [docs/allowed-apis.md](docs/allowed-apis.md) before changing code.

## Repository Map

```
src/
  app/
    api/
      air-quality/    POST /api/air-quality (live Open-Meteo + labeled sample fallback)
      explain/        POST /api/explain (server-side Gemini 2.5 Flash + deterministic fallback)
      geocode/        GET /api/geocode?q=... (Open-Meteo city search suggestions)
    globals.css       Tailwind v4 CSS-first semantic tokens (light & dark OKLCH)
    layout.tsx        Root layout, fonts, ThemeProvider, skip-to-content link
    page.tsx          Static-first home page shell
  components/
    airq/             Domain UI components (ContextBuilderForm, AqiAttributionCard, RecommendationBoard, ExplanationPanel, AirqDashboard)
    shared/           Reusable UI primitives (PageHeader, EmptyState, ErrorState, ThemeToggle)
    ui/               shadcn/ui primitives
  lib/
    ai/               Grounded GenAI explanation adapter + deterministic fallback
    aqi/              Zod schemas, US EPA vs India CPCB scales, Open-Meteo adapter
    fixtures/         Curated sample AQI scenarios
    http/             Shared JSON request parser
    policy/           Pure deterministic safety-aware policy engine
    storage/          Browser sessionStorage persistence
docs/                 allowed-apis.md, adr/, definition-of-done.md
plans/                Numbered phase plans (01–07) + README.md
```

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start Next.js dev server |
| `pnpm lint` | ESLint (`--max-warnings 0`) |
| `pnpm typecheck` | TypeScript (`tsc --noEmit`) |
| `pnpm build` | Production Next.js build |
| `pnpm test` | Vitest unit and component tests |
| `pnpm format:check` | Prettier style check |

Node `>= 20.9.0` (tested on `24.12.0`). Package manager pinned to `pnpm@10.28.1`.

## Non-Negotiables

- **MUST NOT** commit secrets, `.env` files, or API keys; `.env.example` holds keys only.
- **MUST NOT** conflate **US EPA AQI** with **India/CPCB AQI** or relabel `us_aqi` as CPCB AQI.
- **MUST NOT** advise sealing homes when indoor fuel burning is active; state indoor air cannot be verified without sensors.
- **MUST NOT** invent quantitative health or CO2 savings, or make medical diagnoses.
- **MUST** keep the repository on a single branch and under `10 MB`.
