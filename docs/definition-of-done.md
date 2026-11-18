# Definition of done

A change is **not done** until every line holds. Copy this into `AGENTS.md` §3 and keep it
identical to `.github/pull_request_template.md` and the CI workflow; when one changes, all three
change in the same PR (rules 10.5 / 10.9). Nothing below is ticked without being run.

## Mechanical - CI enforces these

- [ ] `<PM> lint` passes at `--max-warnings 0`.
- [ ] `<PM> typecheck` passes.
- [ ] `<PM> build` passes for every workspace.
- [ ] `<PM> test` passes; `<PM> test:e2e` passes where the change touches a user flow.
- [ ] Formatter run on every touched file (`<PM> format:check` clean); no unrelated reformatting
      mixed into a logic change.
- [ ] Generated types regenerated and committed: `<GEN_TYPES_COMMAND> && git diff --exit-code` clean.
- [ ] No secret, key, token or `.env` file committed; secret scan clean.
- [ ] `<PM> audit --audit-level high` reports nothing new.
- [ ] Standing guards (AGENTS.md §4) all return what they must.

## Judgement - the reviewer enforces these

- [ ] Tests exist for the behaviour added or fixed and fail without the change; no test deleted or
      weakened.
- [ ] Every new dependency is in `docs/allowed-apis.md` in this PR with version from the lockfile,
      Use, Never, justification and docs URL.
- [ ] No API, parameter, hook or version was invented; each is on the allowed list or in an official
      doc fetched this session.
- [ ] The server-only / service-role key is absent from every browser and app bundle - checked in
      the built output.
- [ ] Untrusted input is validated server-side; no PII, token or OTP in logs.
- [ ] Cross-cutting standards hold for every UI or API surface touched: components reused or
      promoted · usage headers on exports · business-timezone display · shared formatters only ·
      all four UI states · route stays static (Next.js).
- [ ] Seed parity: a new permission, role or lookup row is in `<SEED_FILE>` in this PR.
- [ ] Plan, ADR or runbook updated where the change alters a premise or a procedure; the phase
      file's status line is current.
- [ ] Stack gates for the detected stack: <pgTAP for new RLS policies | Theme Check 0 REQUIRED +
      PHPCS clean | device or EAS build | OpenAPI regenerated>.
- [ ] The phase verification checklist was **executed** and its output pasted into the PR; every
      skipped check is named with its reason.
- [ ] PR is under ~400 changed lines or the split is justified; the description covers what, why,
      how tested, risks.

<!--
Brain provenance (delete this comment when copying into a repo):
Sources
- private/git-repo/claredesk/booking/AGENTS.md (§3 Definition of done)
- private/git-repo/claredesk/booking/.github/pull_request_template.md
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/08-workflow-and-verification.md ("Done means")
- private/git-repo/claredesk/trionex/AGENTS.md
- development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md
Consolidated 2026-11-08
-->
