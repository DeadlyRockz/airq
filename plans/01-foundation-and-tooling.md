# Phase 01 - Foundation, Tooling & Repo Setup

**Depends on:** User approval of Tech Stack Recommendation & Work Hierarchy. **Blocks:** Phase 02.
**Deliverable:** Runnable Next.js App Router + TypeScript + Tailwind v4 + shadcn/ui + Zod + Vitest skeleton with `pnpm`, lint/format config, `.env.example`, `docs/allowed-apis.md`, and `docs/tech-stack-recommendation.md`.
**Status:** done 2026-11-18

> Prerequisites: read `AGENT.md`, controller `core/00-non-negotiables.md` and `core/08-tech-stack.md`, and `plans/README.md`. Implement this phase only.

## 1. Goal

Stand up a clean, strictly typed Next.js App Router workspace with Tailwind CSS v4 semantic tokens (light and dark), shadcn/ui primitives, Zod, and Vitest, plus the repo's governance docs (`docs/tech-stack-recommendation.md`, `docs/allowed-apis.md`, `.env.example`, `.gitignore`) so every subsequent phase builds on verified tooling.

## 2. Scope

**In:**
- Initialize `package.json` (`packageManager: "pnpm@..."`), `tsconfig.json` (`strict: true`), Next.js App Router, Tailwind v4 `globals.css` with semantic tokens, shadcn/ui base components.
- Configure ESLint 9+ flat config (`--max-warnings 0`), Prettier, and Vitest.
- Create `.gitignore` (excluding `node_modules`, `.next`, `.env*`, `dist`, `coverage`), `.env.example` (keys only), `docs/tech-stack-recommendation.md`, and `docs/allowed-apis.md`.

**Out (deferred):**
- Domain schemas and AQI policy logic → `plans/02-aqi-model-and-safety-policy.md`
- Sample demo fixtures → `plans/03-fixtures-and-demo-mode.md`

## 3. Steps

### 01.1 - Scaffold Next.js + Tailwind v4 + Vitest
- Initialize Next.js App Router with TypeScript and `pnpm`.
- Install `zod`, `lucide-react`, `next-themes`, and dev dependencies (`vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `eslint`, `prettier`).
- Initialize shadcn/ui (`Button`, `Card`, `Input`, `Badge`, `Select`, `Skeleton`, `Alert`, `Label`).
- **Verify:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

### 01.2 - Governance & Environment Docs
- Write `docs/tech-stack-recommendation.md` with versions resolved from `pnpm ls --depth 0`.
- Write `docs/allowed-apis.md` with Use/Never rules for Next.js, React, Tailwind v4, shadcn/ui, Zod, and Vitest.
- Write `.env.example` (optional `GEMINI_API_KEY=` only; no secrets) and verify `.gitignore` blocks `.env*`.
- **Verify:** `git check-ignore -v .env` (once git is initialized)

## 4. Verification checklist

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

- [ ] `pnpm lint` exits 0 with `--max-warnings 0`
- [ ] `pnpm typecheck` exits 0 with `strict: true`
- [ ] `pnpm test` runs Vitest cleanly
- [ ] `pnpm build` succeeds
- [ ] `.env.example` has keys only; `.gitignore` excludes `.env`, `node_modules`, `.next`, `coverage`
- [ ] `docs/tech-stack-recommendation.md` and `docs/allowed-apis.md` match installed versions

## 5. Anti-pattern guards

- **MUST NOT** use `npm` or `yarn`; use `pnpm` only.
- **MUST NOT** add `tailwind.config.js` (Tailwind v4 uses CSS-first `@theme` in `globals.css`).
- **MUST NOT** commit any real API keys or `.env` files.
- **MUST NOT** add database, ORM, or auth dependencies for MVP (`AGENT.md` specifies no login/DB necessary).

## 6. Exit criteria

Phase 01 is complete when all checklist items in §4 pass with pasted output and `plans/README.md` is updated to `done`.

