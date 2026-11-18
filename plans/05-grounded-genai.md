# Phase 05 - Optional Grounded GenAI Explanation Layer

**Depends on:** Phase 02, Phase 04. **Blocks:** Phase 06.
**Deliverable:** Server-side GenAI explanation adapter (`src/lib/ai/explain.ts`) and `/api/explain` route that turns deterministic policy output into clear, grounded explanations-with automatic deterministic fallback when no API key is configured.
**Status:** done 2026-11-18

> Prerequisites: read `AGENT.md`, `plans/README.md`, `docs/allowed-apis.md`. Implement this phase only.

## 1. Goal

Add genuine GenAI value on top of the deterministic safety policy: explain *why* specific routine changes, indoor precautions, and sustainable trade-offs matter for the user's exact context-while treating model output as untrusted, never contradicting safety rules, and working seamlessly without an API key via deterministic fallback.

## 2. Scope

**In:**
- `src/lib/ai/explain.ts`:
  - Checks `process.env.GEMINI_API_KEY` on the server only.
  - Builds a strictly grounded prompt containing only the validated `AqiReading` and `PolicyRecommendation` (sanitized user inputs, no prompt-injection pass-through).
  - Calls Gemini REST API (or `@google/genai` if added to `allowed-apis.md`) with JSON schema output, validated by Zod.
  - Falls back to a clean, structured deterministic explanation builder when `GEMINI_API_KEY` is absent, rate-limited, or returns invalid/unsafe output.
- `src/app/api/explain/route.ts`: Validates input with Zod and returns `{ explanation, mode: "genai" | "deterministic-fallback" }`.
- Unit tests verifying no-key fallback, invalid-model-output fallback, and prompt grounding.

**Out (deferred):**
- UI rendering → `plans/06-ui-and-user-journey.md`

## 3. Steps

### 05.1 - Grounded GenAI Adapter & Deterministic Fallback
- Implement `generateGroundedExplanation(context, reading, policy)` with Zod output validation (`ExplanationSchema`: `headline`, `whyItMatters`, `tradeOffSummary`, `assumptionNote`).
- Reject or fall back if model output omits required fields or exceeds length bounds.
- **Verify:** `pnpm test src/lib/ai`

### 05.2 - `/api/explain` Route Handler
- Validate request payload with Zod; never trust client-supplied policy overrides (re-compute or verify policy server-side).
- **Verify:** `pnpm test src/app/api/explain`

## 4. Verification checklist

```bash
pnpm lint && pnpm typecheck && pnpm test
```

- [ ] Zero API keys in client code (`src/components/`, `NEXT_PUBLIC_*`)
- [ ] Works cleanly with `GEMINI_API_KEY` unset (returns `mode: "deterministic-fallback"`)
- [ ] Malformed or failed LLM responses fall back gracefully without 500 errors
- [ ] Model output is Zod-validated before reaching the UI

## 5. Anti-pattern guards

- **MUST NOT** let the LLM invent AQI numbers, health claims, or CO2 savings not present in the deterministic policy.
- **MUST NOT** pass raw unsanitized user free-text directly into system instructions.
- **MUST NOT** expose `GEMINI_API_KEY` in any `NEXT_PUBLIC_` variable or client bundle.

## 6. Exit criteria

Phase 05 is complete when AI adapter and route tests pass and `plans/README.md` is updated.

