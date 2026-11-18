# ADR-0001: AirQ Tech Stack & Stateless Browser-Session Architecture

- **Status:** Accepted
- **Date:** 2026-11-18
- **Decision log row:** D-001 in `plans/README.md`

## Context

Challenge 6 requires a responsive, accessible, safety-aware urban air quality assistant that runs reliably with zero required login or database setup, supports no-key fallback operation, and enforces strict server-side handling for optional GenAI explanations.

## Decision

1. **Frontend & Full-Stack Framework:** Next.js 16 (App Router) + React 19 + TypeScript (`strict: true`), managed with `pnpm`.
2. **Design System:** Tailwind CSS v4 (OKLCH semantic tokens in `src/app/globals.css`), shadcn/ui primitives, `lucide-react`, and `next-themes`.
3. **Validation & Testing:** Zod at all runtime boundaries; Vitest + Testing Library for pure domain, API route, and UI component tests.
4. **Data & State:** Stateless server-side proxies for Open-Meteo and optional Gemini 2.5 Flash (`GEMINI_API_KEY`), with browser `sessionStorage` for user context and deterministic sample fixtures for automatic fallback.

## Consequences

- Zero database provisioning or credential friction for reviewers and judges.
- Client bundle contains zero API keys and zero heavy external SDKs.
- Deterministic policy engine remains pure and 100% unit-testable without network access.
