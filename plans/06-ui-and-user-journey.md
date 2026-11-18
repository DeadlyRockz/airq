# Phase 06 - Accessible UI & End-to-End User Journey

**Depends on:** Phase 03, Phase 04, Phase 05. **Blocks:** Phase 07.
**Deliverable:** Complete, responsive, light/dark-mode AirQ web application in `src/app/page.tsx` and `src/components/` using shadcn/ui semantic tokens only.
**Status:** done 2026-11-18

> Prerequisites: read `AGENT.md`, `plans/README.md`, `docs/allowed-apis.md`, and UI Design System rules. Implement this phase only.

## 1. Goal

Deliver the end-to-end user journey: **Context -> Reliable AQI Data -> Deterministic Safety Decision -> Personalized Actions -> Grounded GenAI Explanation -> Visible Impact & Trade-offs**, with full accessibility, keyboard navigation, and clear loading/error/demo states.

## 2. Scope

**In:**
- Shared UI components in `src/components/shared/`: `PageHeader`, `EmptyState`, `ErrorState`, `ThemeToggle`.
- Feature components in `src/components/airq/`:
  - `ContextBuilderForm`: City search (live) or Demo Scenario selector (no-key), AQI scale toggle (US EPA vs India/CPCB), sensitivity group, commute/activity, indoor fuel-burning/ventilation toggle.
  - `AqiAttributionCard`: Displays AQI value, matching scale category badge, dominant pollutant, source, unit, timestamp, observation vs forecast badge, uncertainty note, and prominent "Sample / Demo Data" or "Live Data" indicator.
  - `RecommendationBoard`: Daily routine changes, indoor air quality advice (with CO/ventilation safety notice when applicable), sustainable alternatives, and visible trade-offs + documented assumptions.
  - `ExplanationPanel`: Displays the grounded GenAI (or deterministic fallback) explanation with transparent mode badge.
- `src/app/page.tsx` & `src/app/layout.tsx`: Responsive layout with `ThemeProvider`.

**Out (deferred):**
- Final submission audit & README → `plans/07-verification-and-submission.md`

## 3. Steps

### 06.1 - Shared Components & Layout Shell
- Build `PageHeader`, `EmptyState`, `ErrorState`, and `ThemeToggle` using shadcn/ui + Lucide icons (`size-4`, `size-5`).
- **Verify:** `pnpm typecheck`

### 06.2 - Context Form, AQI Attribution & Recommendation UI
- Implement `ContextBuilderForm`, `AqiAttributionCard`, `RecommendationBoard`, and `ExplanationPanel`.
- Wire loading skeletons (`Skeleton`), error states (`ErrorState`), and demo-mode banners.
- **Verify:** `pnpm lint && pnpm typecheck && pnpm build`

## 4. Verification checklist

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

- [ ] Zero hardcoded hex/palette colors or arbitrary bracket sizes in `src/components/`
- [ ] All icon-only buttons have `aria-label`
- [ ] Loading, empty, error, and success states are all implemented and reachable
- [ ] Both light and dark themes render cleanly via semantic tokens
- [ ] Demo mode works with zero env vars and clearly labels sample data

## 5. Anti-pattern guards

- **MUST NOT** use hardcoded colors (`bg-white`, `text-red-500`, `bg-[#...]`) or arbitrary sizes (`text-[13px]`, `p-[14px]`).
- **MUST NOT** use non-Lucide icons or emojis in UI chrome.
- **MUST NOT** render `uppercase`, `tracking-*`, or inline `style={{}}` typography overrides.
- **MUST NOT** hide AQI scale, source, timestamp, or sample-data labels.

## 6. Exit criteria

Phase 06 is complete when `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass and the user journey works end-to-end in the browser.

