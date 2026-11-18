# Project Plan - AirQ (Challenge 6: Urban Air Quality Assistant)

Working plan for **AirQ**, a GenAI-powered, location- and lifestyle-aware urban air quality assistant for Hackathon Challenge 6. Every contributor (human or AI agent) reads this folder together with `AGENT.md`, the controller brain (`~/Prahadeesh/controller`), and `docs/allowed-apis.md` before writing code. Each numbered file is one phase, self-contained enough to execute in a fresh chat context.

- **Status:** Complete - Phases 01–07 implemented and verified (lint, typecheck, 25 Vitest tests, production build). Git init/push and video link remain manual/user-approved steps.
- **Last updated:** 2026-11-18

## Files

| #   | File                                                                         | Covers                                                                                   | Status      |
| --- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------- |
| 01  | [`01-foundation-and-tooling.md`](01-foundation-and-tooling.md)               | Next.js 16 + Tailwind v4 + shadcn/ui + Vitest scaffold, `allowed-apis.md`, `.env.example`| done 2026-11-18 |
| 02  | [`02-aqi-model-and-safety-policy.md`](02-aqi-model-and-safety-policy.md)     | Zod schemas, US vs India/CPCB AQI scales, deterministic safety-aware policy & unit tests | done 2026-11-18 |
| 03  | [`03-fixtures-and-demo-mode.md`](03-fixtures-and-demo-mode.md)               | Deterministic sample scenarios and no-key demo proving personalized recommendations       | done 2026-11-18 |
| 04  | [`04-live-data-and-fallback.md`](04-live-data-and-fallback.md)               | Server-side live AQI adapter (Open-Meteo), caching, attribution, and fallback            | done 2026-11-18 |
| 05  | [`05-grounded-genai.md`](05-grounded-genai.md)                               | Optional server-side GenAI explanation grounded on policy output + deterministic fallback| done 2026-11-18 |
| 06  | [`06-ui-and-user-journey.md`](06-ui-and-user-journey.md)                     | Accessible light/dark UI, context form, AQI attribution, routine/indoor/trade-off cards  | done 2026-11-18 |
| 07  | [`07-verification-and-submission.md`](07-verification-and-submission.md)     | Full test/build audit, README, Challenge 6 compliance check (`< 10 MB`, 1 branch)       | done 2026-11-18 |

## Phase dependency graph

`01 → 02 → 03 → 04 → 05 → 06 → 07` (04 and 05 both depend on 02/03; 06 integrates 03–05; 07 is final verification).

## Decision log

| ID    | Decision                                                                 | Status   | Record                        |
| ----- | ------------------------------------------------------------------------ | -------- | ----------------------------- |
| D-001 | Next.js App Router + TypeScript + Tailwind v4 + shadcn/ui + Zod + Vitest | Proposed | `docs/tech-stack-recommendation.md` (Phase 01) |
| D-002 | No database or auth for MVP; stateless request + optional URL/local state| Proposed | `AGENT.md` §Mandatory behavioral rules |
| D-003 | Strict separation of US AQI (EPA) and India/CPCB AQI scales              | Proposed | `plans/02-aqi-model-and-safety-policy.md` |
| D-004 | Server-side only live AQI & optional GenAI calls with no-key demo fallback| Proposed | `plans/04-live-data-and-fallback.md`, `05-grounded-genai.md` |

## Open questions and risks

| ID   | Question | Blocks | Default if unanswered |
| ---- | -------- | ------ | --------------------- |
| Q-01 | Which LLM provider should power optional GenAI explanations (`GEMINI_API_KEY` vs `OPENAI_API_KEY`)? | Phase 05 | Gemini API (`GEMINI_API_KEY`) server-side with deterministic template fallback when unset |
| Q-02 | Should live AQI use Open-Meteo Air Quality (`us_aqi` + raw pollutants) alone, or also support optional WAQI/OpenAQ? | Phase 04 | Open-Meteo (no-key, `us_aqi` + PM2.5/PM10/O3/NO2) primary, with raw-pollutant CPCB sub-index calculation clearly labeled |

## How to keep this plan alive

- Update the relevant file in the same change that alters the behaviour it describes.
- Record as-built deviations in the phase's completion record; never retro-fit the plan text.
- Tick milestone checkboxes only after running the verification commands and pasting output.
- Bump **Last updated** on every edit, and the **Status** line whenever a phase starts or finishes.

