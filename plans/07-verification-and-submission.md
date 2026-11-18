# Phase 07 - Tests, Documentation & Submission Compliance

**Depends on:** Phase 06. **Blocks:** None (final phase).
**Deliverable:** Production-ready repository with complete `README.md`, passing test/build gates, and verified Challenge 6 submission compliance.
**Status:** done 2026-11-18

> Prerequisites: read `AGENT.md` §Submission contract, `plans/README.md`. Implement this phase only.

## 1. Goal

Verify every functional, security, and hackathon submission requirement: full Vitest suite, clean production build, comprehensive `README.md`, and repository hygiene (`< 10 MB`, single branch, no secrets or build artifacts in Git).

## 2. Scope

**In:**
- Complete `README.md` covering: challenge vertical, architecture & policy logic, US vs CPCB AQI distinction, documented assumptions, local setup (no-key demo + optional GenAI), data sources, known limitations, test commands, and demo walkthrough steps.
- UI/component tests in Vitest + Testing Library for key user flows (demo mode switch, scale switch, safety warning visibility).
- Submission compliance audit script/checks:
  - `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
  - Repo size check (`du -sh` excluding `.git`, and total git repo `< 10 MB`)
  - Single branch check (`git branch -a`)
  - Secret & artifact grep check (no `.env`, `node_modules`, `.next`, `dist`, `coverage` tracked)

**Out:**
- External `git push` or hackathon portal submission (requires explicit user approval per `AGENT.md`).

## 3. Steps

### 07.1 - Complete README & UI Tests
- Write `README.md` per `AGENT.md` §Mandatory behavioral rules and controller `core/05-documentation.md` §5.2.
- Add UI component tests for `AqiAttributionCard` and `RecommendationBoard`.
- **Verify:** `pnpm test`

### 07.2 - Compliance & Hygiene Audit
- Run all quality gates and repo size / branch / secret checks.
- Paste exact outputs into the Completion Record below.
- **Verify:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

## 4. Verification checklist

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
git status --short
git branch -a
```

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all exit 0
- [ ] `README.md` covers all required sections from `AGENT.md`
- [ ] Repository has 1 branch and total tracked size is `< 10 MB`
- [ ] No `node_modules`, `.next`, `.env`, `dist`, or `coverage` tracked in Git
- [ ] No secrets or API keys anywhere in tracked files

## 5. Anti-pattern guards

- **MUST NOT** push to GitHub or submit to the hackathon portal without explicit user permission.
- **MUST NOT** fabricate QA, deployment, or video link claims.

## 6. Exit criteria

Phase 07 is complete when every gate in §4 passes with pasted output and `plans/README.md` is marked `Complete`.

