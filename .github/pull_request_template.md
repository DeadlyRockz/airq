<!--
  Required reading before opening this PR: AGENTS.md (repo root) → the brain rules (AGENTS.md §1.1),
  docs/allowed-apis.md, plans/standards.md, and your phase plan.
  Keep this PR small and focused - ideally under ~400 changed lines. Split larger work.
-->

## What changed

<!-- One paragraph. What a reviewer needs to know before reading the diff. -->

## Why

<!-- The problem, not the solution. Link the phase plan section and/or ADR. -->

- Phase / plan section:
- Related issue / ticket:
- ADR (if this changes an architectural premise - rules 5.3 / 10.3):

## How it was tested

<!-- Commands you actually ran and what they returned. "CI is green" is not a test plan.
     Name every check you skipped and why. -->

## Risks and follow-ups

<!-- Anything a reviewer should watch, plus work deliberately deferred - and the plan file that now holds it. -->

---

## Engineering-rules checklist

### Code quality (01) · Version control (02)

- [ ] `<PM> lint`, `<PM> typecheck`, `<PM> build` and `<PM> test` all pass locally.
- [ ] Formatter run on every file I touched, and **no unrelated reformatting is mixed into a
      logic change**.
- [ ] Every error is handled or explicitly propagated - no silent `catch {}`.
- [ ] PR is under ~400 changed lines, or the split was justified above.

### Testing (03)

- [ ] Tests cover the behaviour added or fixed; they fail without the change.
- [ ] **No test, lint rule, type or verification grep was deleted or weakened to make CI green.**
      If a guard was deliberately _narrowed_, it is called out under "Risks" with a reason.
- [ ] Tests are deterministic - no wall-clock, no ordering, no network dependence.

### Security (04)

- [ ] No secret, key, token or `.env` file is committed.
- [ ] Untrusted input is validated **server-side**, not only in the UI.
- [ ] No token, OTP code or PII appears in logs or error tracking.
- [ ] The server-only / service-role key does not reach any browser or app bundle - **verified
      against the built output**, not just the source.

### Documentation (05) · Architecture (06)

- [ ] Every new dependency is listed in `docs/allowed-apis.md` **in this PR**, with its version
      from the lockfile, a justification and its "Never" cases.
- [ ] Module boundaries respected; no new cross-layer import; third-party SDKs stay behind their
      adapter.
- [ ] Docs are part of done: phase plan, ADR or runbook updated where the change warrants it.

---

## Cross-cutting standards (rule 11 · `plans/standards.md`)

- [ ] **Components reused or promoted correctly** - nothing re-implemented that the shared UI
      package already provides; anything used twice was promoted (11.1).
- [ ] **Usage headers on exports** - every exported function, hook, service method and component
      has one, with `@example` (11.2).
- [ ] **Business-timezone display** - every rendered date/time resolves in the business or venue
      timezone, never the browser's or device's (11.3).
- [ ] **Shared formatters only** - no inline date/money/phone formatting anywhere; money stays
      integer minor units; phones stay E.164 (11.4).
- [ ] **All four UI states** - loading, empty, error and success are each implemented for every
      data view added or changed (11.5).
- [ ] **Route stays static** (Next.js apps) - no accidental switch to dynamic rendering; checked
      against the build's route table. A route that IS fully dynamic (`ƒ`) needs written
      justification here or a pointer to a standing one: <STANDING_DYNAMIC_ROUTE_JUSTIFICATION>.

---

## Seed parity

- [ ] This change **adds a permission, role or lookup row** → `<SEED_FILE>` is updated **in this
      PR**. _(Tick the box below instead if it adds none.)_
- [ ] This change adds no permission, role or lookup row.

> Permission checks resolve from **seeded rows**. A permission introduced in code or a migration
> but missing from the seed does not throw - it silently evaluates to "no permission" and takes
> every integration spec with it. This box is load-bearing.

---

## Stack gates (delete the rows that do not apply to this repo)

- [ ] Generated database types regenerated → `git diff --exit-code` clean (`<GEN_DB_TYPES_COMMAND>`).
- [ ] Generated API client types regenerated → `git diff --exit-code` clean (`<GEN_API_TYPES_COMMAND>`).
- [ ] Every new or changed RLS policy has a pgTAP test; the migration is hand-written SQL.
- [ ] Expo: `npx expo install --check` clean; the change ran on a device or simulator, not only
      through a type-check.
- [ ] WordPress: `vendor/bin/phpcs` clean, Theme Check 0 REQUIRED, page load clean with `WP_DEBUG` on.

---

## Standing guards

Tick each one you **ran** (AGENTS.md §4); paste any non-empty output under "How it was tested":

- [ ] `<GUARD_1_COMMAND>` → `<expected>`
- [ ] `<GUARD_2_COMMAND>` → `<expected>`
- [ ] `<GUARD_3_COMMAND>` → `<expected>`

<!--
Brain provenance (delete this comment when copying into a repo):
Sources
- private/git-repo/claredesk/booking/.github/pull_request_template.md
- private/git-repo/claredesk/booking/AGENTS.md
- private/git-repo/claredesk/booking/plans/standards.md
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/08-workflow-and-verification.md
- private/git-repo/claredesk/trionex/AGENTS.md
Consolidated 2026-11-08
-->
