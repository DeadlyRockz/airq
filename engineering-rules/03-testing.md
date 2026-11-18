# 03 - Testing

Tests are how we prove the code works and keep it working. Untested behavior is assumed
broken.
Applies to: every repository. Stack-specific testing (`jest-expo` / React Native Testing
Library and platform-plus-theme coverage for Expo, pgTAP for database policies, Playwright for
web e2e) lives in the matching ../stacks/*.md file and extends this rule; it never replaces it.

## 3.1 When tests are required

- **MUST** add or update tests for every new feature and every bug fix.
- **MUST** write a failing test that reproduces a bug _before_ fixing it (regression
  test).
- **MAY** skip tests only for pure, mechanical changes (formatting, renames covered by
  the compiler, docs). State this in the PR.
- **MUST** make new tests fail without the change and pass with it; a test that passes on the
  old code proves nothing.
- **MUST** add tests for every new access policy, permission or role: pgTAP for RLS policies,
  guard/spec tests for API permissions. See ../stacks/supabase.md and ../stacks/nestjs-backend.md.

## 3.2 The test pyramid

- **SHOULD** favor many fast **unit tests**, fewer **integration tests**, and a small
  number of **end-to-end tests**.
- **MUST** keep unit tests isolated - no network, no real database, no filesystem unless
  that is the unit under test.
- **MUST** run data-layer integration tests against a real local database (Supabase CLI or
  Docker), not mocks, when the repo has a database; that suite is the only thing coupling the
  SQL to the code that reads it. See ../stacks/supabase.md.

## 3.3 Quality of tests

- **MUST** make each test assert one clear behavior.
- **MUST** name tests to describe the behavior: `returns_403_when_token_missing`, not
  `test1`.
- **MUST** follow Arrange–Act–Assert structure.
- **MUST NOT** write tests that depend on execution order or shared mutable state.
- **MUST NOT** assert on incidental details (exact log strings, timestamps) that make
  tests brittle.
- **SHOULD** cover edge cases: empty input, nulls, boundaries, error paths - not just
  the happy path.
- **MUST** keep tests deterministic: no wall-clock (`new Date()` without a fixed clock), no
  ordering dependence, no network dependence.
- **MUST** test money paths in integer minor units and date paths with an explicit
  business-timezone fixture (./11-cross-cutting-standards.md).

## 3.4 Coverage, and never weakening a guard

- **SHOULD** keep meaningful coverage of critical logic. Coverage percentage is a
  signal, not a goal - 100% of trivial getters proves nothing.
- **MUST NOT** delete or weaken a test just to make a build pass. Fix the code.
- **MUST NOT** weaken or delete a test, lint rule, standing guard grep or verification check to
  make CI green. If a guard is deliberately _narrowed_, do it in its own commit and say why under
  "Risks and follow-ups" in the PR (./02-version-control.md §2.4).
- **MUST NOT** add a file to a legacy allowlist / backlog that downgrades a rule from error to
  warning; entries may only be removed, once the file is clean.
- **MUST NOT** leave a test `skip` / `todo` / `xit` / `.only` without a ticket reference in the
  test body; `.only` never reaches a protected branch.

## 3.5 Running tests

- **MUST** run the full test suite locally (or in CI) before requesting review.
- **MUST** ensure tests are deterministic - a flaky test MUST be fixed or quarantined
  with a ticket, never ignored.
- **MUST** keep the test suite green on the default branch at all times.
- **MUST** run the full local gate before requesting review: `lint`, `typecheck` (or
  `check-types`), `test`, `build` - `pnpm turbo run lint typecheck test build` in a monorepo or
  the project's equivalent. CI runs the same four (../stacks/ci-github-actions.md).
- **MUST** paste the commands actually run and their result in the PR and in the final report.
  "Should pass" is not a result (./10-workflow-and-verification.md).

## 3.6 Generated artifacts and standing guards

- **MUST** treat generated types and clients as tested artifacts: after a migration or API
  change, regenerate (`pnpm db:types`, `pnpm gen:api-types` or the project's equivalent), verify
  `git diff --exit-code` is clean, and commit the output in the same change
  (./02-version-control.md §2.2).
- **MUST** keep seed data in parity with code: when a change adds a permission, role or lookup
  row, the seed file is updated in the same PR. An unseeded permission fails silently at runtime
  and takes every integration spec with it. See ../stacks/supabase.md.
- **MUST** run every standing guard the repo's AGENTS.md or plan lists (grep-able invariants
  with an expected result) and report each result (./10-workflow-and-verification.md).
- **MUST** keep CI able to build without real services: placeholder env values generated from
  `.env.example`, never real secrets (../stacks/ci-github-actions.md).

## 3.7 Default tooling for new projects (project profile may override)

- Unit and integration: **Vitest** for packages and Next.js apps; **Jest** for NestJS
  (`ts-jest`) and for Expo (`jest-expo` + React Native Testing Library).
- End-to-end: **Playwright** for web apps; backend e2e with the framework's harness (NestJS
  `test/` or `e2e/` + supertest).
- Database policies: **pgTAP** via the Supabase CLI (`pnpm db:test` or equivalent).
- Placement: `*.test.ts` next to the unit or in `__tests__/`; e2e in `e2e/`. File and test
  names describe behaviour.
- Templates: ../templates/ci.yml, ../templates/definition-of-done.md.

## Sources

- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/03-testing.md (baseline; byte-identical in 8 of 9 repos)
- private/git-repo/claredesk/billing/claredesk-billing/apps/app/engineering-rules/03-testing.md (pointer to stack-specific testing)
- private/git-repo/claredesk/booking/AGENTS.md (§2.1 commands, §3 definition of done, §4 standing guards)
- private/git-repo/claredesk/booking/.github/pull_request_template.md (never weaken a test/lint/grep; determinism; seed parity)
- private/git-repo/claredesk/trionex/AGENTS.md and development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md (`pnpm db:types`, `pnpm db:test`, pgTAP for new policies)
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/AGENTS.md (`design-backlog.json`: remove only, never add)
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/.github/workflows/ci.yml (lint/typecheck/test/build gate, placeholder env)
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/00-non-negotiables.md (item 12: verification is run, not asserted)
- Consolidated 2026-11-08
