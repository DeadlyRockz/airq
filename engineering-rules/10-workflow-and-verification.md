# 10 - Workflow & Verification

How a unit of work starts, runs and is declared done - for a human or an agent, in any stack. The project profile (`../projects/<profile>.md`, found through `../projects/registry.tsv`) supplies the concrete commands, plan folder, guard list and access mode; this file supplies the procedure.

Applies to: every repository and every Claude session on this machine, from a one-line fix to a multi-phase build.

## 10.1 Session start protocol

- **MUST** read, before producing or changing code, in this order: the project profile; the plan index (`plans/README.md` or `plans/00-master.md`); the phase file for the area being touched; the allowed-APIs list (`docs/allowed-apis.md`, or the path the profile names); and the stack packs for the detected stack (`../stacks/*.md`, routed by `../CLAUDE.md` and the path-scoped files in `../rules/`).
- **MUST** treat the phase file's "Verification checklist" and "Anti-pattern guards" as binding acceptance criteria for that work.
- **MUST** read the matching stack pack *before* writing that kind of code, not after a guard rejects it.
- **MUST** implement only the module or phase in front of you. Something needed from a later module gets noted in that module's file, not built early and half-wired.
- **MUST** resolve framework versions from the lockfile and read the installed or bundled docs when the version is newer than what you remember; the bundled-docs rule is in `../stacks/nextjs.md`.
- **SHOULD** open a fresh context for a new module with: "Read <plan index>, <allowed-APIs list>, `00-non-negotiables.md` and <phase file>. Implement that module only. Do not skip the verification checklist."
- **SHOULD**, when a repo has no `AGENTS.md`, plan folder or allowed-APIs list, create them from `../templates/` before the first feature PR. A one-line fix does not need a plan; a new module does.

## 10.2 Plan folder convention

- **MUST** keep the build plan in `plans/` (default; `plan/` where the profile says so) as an index plus numbered phase files `NN-<topic>.md`. Each phase file is self-contained enough to execute in a fresh chat context.
- **MUST** give the index a **Status** line, a **Last updated** line, a files table (`#` / file / covers), a decision log table (`ID` / decision / status / record linking the ADR) and a "How to keep this plan alive" section. Template: `../templates/plan-README-template.md`.
- **MUST** give every phase file: depends-on / blocks, deliverable, numbered steps, a **Verification checklist** of runnable commands with checkboxes, **Anti-pattern guards** (what not to do, and why) and exit criteria. Template: `../templates/plan-phase-template.md`.
- **MUST** update the plan in the same change when a change alters behaviour described there. A plan that lags the code is wrong documentation, which is worse than none.
- **MUST** record the as-built choice in the phase's completion record, with the reason for each deviation. **MUST NOT** retro-fit the plan text to pretend it predicted the result.
- **MUST** tick milestone and checklist boxes as work merges, not before.
- **SHOULD** close a finished phase with a dated completion record: gate output pasted, deviations, open items and who clears them.
- **MUST** keep the decision log and `docs/adr/` in agreement: every hard-to-reverse decision is one row and one ADR.

## 10.3 Architecture Decision Records

- **MUST** record significant, hard-to-reverse decisions as `docs/adr/NNNN-title.md` with **Status**, **Date**, **Context**, **Decision** and **Consequences**; **SHOULD** add alternatives considered when more than one option was viable. Template: `../templates/adr-template.md`.
- **MUST** write the ADR *before* introducing a new framework, datastore, hosting platform, auth or tenancy model, or major architectural pattern (05-documentation.md §5.3). Where writes happen, how time and money are represented, and the shape of a payment or notification port are always ADRs.
- **MUST** produce a new ADR, or supersede an existing one, when a decision changes an ADR's premise. **MUST NOT** rewrite an accepted ADR's Decision in place; set its status to "Superseded by ADR-NNNN" and link both ways.
- **MAY** backfill an ADR for a decision already in force; its status line **MUST** say it is retroactive and cite where the decision was taken.
- **MUST** add a decision-log row for every ADR and link the ADR from the PR that introduces the change (`../templates/pull_request_template.md`).

## 10.4 Allowed-APIs discipline

- **MUST** keep a per-technology **Use / Never** list (`docs/allowed-apis.md`; the profile may name another path) with a version in every section heading, resolved from the lockfile (`pnpm ls -r --depth 0`, `composer show`, `npx expo install --check`) - never from memory or plan prose. When the list and the lockfile disagree, the lockfile wins: fix the list in the same PR. Template: `../templates/allowed-apis-template.md`.
- **MUST NOT** use a library, API, hook, parameter, CLI flag or version that is not on the list and not in an official doc page fetched this session. An API that is in neither does not exist.
- **MUST** add a new API or dependency to the list in the same PR that introduces it: version from the lockfile, Use, Never, a one-line justification, and the documentation URL with the date it was read. Otherwise the PR is blocked.
- **MUST NOT** invent an API, a parameter, a hook name or a version number. Look it up or ask. A "should exist" method is a bug, not a placeholder.
- **MUST** mark a library that is specified but not installed `(planned)` with a proposed version, and re-resolve the version in the PR that installs it.
- **MUST** state plainly where official documentation could not be found, and write code that degrades safely there, rather than filling the gap with invented content.
- **SHOULD** confine each third-party SDK to one adapter directory so a `git grep` of its name proves the confinement (06-architecture.md).

## 10.5 Definition of done

A change is **not done** until every line holds. The checklist alone is `../templates/definition-of-done.md`; the PR template and CI mirror it (10.9).

- **MUST** have lint, typecheck, build and tests green, using the commands the profile or `AGENTS.md` names, with lint at `--max-warnings 0`.
- **MUST** have run the formatter on every touched file, with no unrelated reformatting mixed into a logic change (01-code-quality.md).
- **MUST** have tests for the behaviour added or fixed that fail without the change, and no test deleted or weakened to pass (03-testing.md).
- **MUST NOT** have committed a secret, key, token or `.env` file; a server-only key **MUST NOT** reach any browser or app bundle - verified against the built output, not the source (04-security.md).
- **MUST** have every new dependency on the allowed-APIs list in the same PR (10.4).
- **MUST** have updated the phase plan, an ADR or a runbook when the change alters an architectural premise or an operational procedure (05-documentation.md §5.5).
- **MUST** have regenerated and committed generated types (database, OpenAPI clients) with the drift check clean: regenerate, then `git diff --exit-code` (`../stacks/supabase.md`, `../stacks/nestjs-backend.md`).
- **MUST** have **seed parity**: a change that adds a permission, role or lookup row updates the seed file in the same PR. A permission resolved from seeded rows fails silently when unseeded and takes every integration spec with it.
- **MUST** satisfy 11-cross-cutting-standards.md for every UI or API surface touched, and the stack pack's own gates for the detected stack (PHPCS and Theme Check, pgTAP, a device build, the route table).
- **MUST** have executed the phase verification checklist and the standing guards (10.6) with output pasted (10.7).
- **MUST NOT** tick a checklist item you did not run.

## 10.6 Standing guards

- **MUST** list the repo's grep-able invariants in `AGENTS.md` under "Standing guards" as a table - command, what it must return, why - and tick each one in the PR template.
- **MUST** run every standing guard before calling work done.
- **MUST NOT** weaken a guard to make it pass. A guard **MAY** be narrowed deliberately, with the reason in the PR and in the plan's decision or discovery file; excluding the files where the guarded thing actually ships is a weakening, not a narrowing.
- **SHOULD** make a guard read shipped code (`apps/`, `packages/`, `src/`) and not only prose; a guard whose own definition lives inside its search path goes red the moment it is committed.
- Typical guards: a legacy project or brand name absent from shipped code; an off-palette colour name absent from tokens and components; regenerate types then `git diff --exit-code` clean; a third-party SDK imported only inside its adapter directory; a secret-shaped string absent from the tree; raw design values absent from components (`../stacks/design-tokens-and-theming.md`).

## 10.7 Verification is run, not asserted

- **MUST** execute every checklist item and paste the command and its output - not summarised, not asserted.
- **MUST** state what was run and what it returned. "Should pass", "should be fine" and "CI is green" are not results.
- **MUST** name every skipped check and why (`SKIP <check> - <reason>`: tool not installed, environment not provisioned, no CLI exists), and list the manual gates no script can run.
- **MUST** paste the failure when something fails, then fix the code (10.12).
- **MUST NOT** read a green CI run as verification of something CI does not exercise - a device run, a real card tap, a browser click-through. If nothing has been clicked through in a browser or on a device, say exactly that.
- **SHOULD** give each repo one gate script that runs the automatable subset with `PASS` / `FAIL` / `SKIP` counts and prints the manual list at the end (pattern: `../templates/wordpress-checks/gates.sh`).

## 10.8 Reporting honestly

- **MUST** report what actually happened. If something is broken, incomplete or skipped, say so plainly (07-collaboration-and-review.md §7.5).
- **MUST** separate a report into verified (ran, output shown), unverified (could not run, and why) and deferred (noted in a later phase file).
- **MUST** stop and report when a required access mode is unavailable - an MCP server unauthenticated, a credential missing, a tool not installed - and **MUST NOT** fall back silently to a path the profile forbids.
- **MUST** structure a hand-off the way the PR template does: what changed, why, how it was tested (commands and outputs), risks and follow-ups.
- An unverified claim eventually becomes a public performance number, a marketplace submission or a confirmed booking nobody paid for. Treat it as such.

## 10.9 Mechanical enforcement layers

| Layer | Mechanism | Where |
| --- | --- | --- |
| Always in context | repo `CLAUDE.md` → `AGENTS.md`; the brain's routing table | repo root; `../CLAUDE.md` |
| Session start | `SessionStart` hook prints a short brief of the rules in force | `.claude/settings.json` → the repo's `engineering-rules/checks/session-brief.sh` (template: `../templates/wordpress-checks/session-brief.sh`) |
| Every edit | `PostToolUse` hook on Edit/Write runs the anti-pattern guard; a blocking finding returns as an error | the repo's `engineering-rules/checks/guard.sh --hook` (template: `../templates/wordpress-checks/guard.sh`) |
| Lint | ESLint / PHPCS rulesets encode the checkable rules: raw design values, bare `<img>`, escaping | `../templates/design-enforcement/README.md` |
| Gate | one script runs guard, lint, typecheck, tests and build with PASS/FAIL/SKIP | the repo's `engineering-rules/checks/gates.sh` (template: `../templates/wordpress-checks/gates.sh`) |
| CI | mirrors the PR checklist's mechanical subset, including type-drift jobs | `../stacks/ci-github-actions.md`, `../templates/ci.yml` |
| PR template | mirrors the rules, the cross-cutting standards, seed parity and the standing guards | `../templates/pull_request_template.md` |

- **MUST** keep the always-on set small and route the rest by trigger (`../rules/*.md`); loading every file every session costs the context the work needs.
- **SHOULD** ship every new MUST that can be checked mechanically together with its check, in the same change.
- **MUST** keep the definition of done, the PR template and CI saying the same list; when one changes, the other two change in the same PR.
- A hook or lint error means fix the code, never the rule (10.12).

## 10.10 Subagent briefing

- **MUST**, when delegating, hand the subagent a rules brief distilled from the project profile and the relevant stack packs - the facts, commands, allowed-APIs entries, phase section, standing guards and definition of done it needs - instead of the whole corpus.
- **MUST** name the files the subagent may write, the files it must not touch, and the single step it owns.
- **MUST NOT** let a subagent add a dependency, change a rule, lint config, test or guard, or edit the plan, unless the brief says so explicitly.
- **MUST NOT** paste a secret value into a brief; name the file or variable instead.
- **MUST** require the subagent to return: files changed, commands run with output, checks skipped with reasons, and anything it could not verify.
- **MUST** re-run the gates and standing guards on the merged result yourself. Delegating the work does not delegate the verification.

## 10.11 Scope discipline and small checkable steps

- **MUST** work in small, checkable steps: write the code, run the guard, run the relevant gate, then move on. Discovering a whole subsystem is unescaped at the final module costs days.
- **MUST** keep one sub-phase to one branch and one PR of under ~400 changed lines (02-version-control.md); split larger work and say how.
- **MUST** copy the established pattern - the phase file names the reference file ("copy from, do not invent") - rather than introduce a second way to do what the repo already does (06-architecture.md).
- **MUST NOT** mix a wholesale reformat, rename or dependency upgrade with a logic change.
- **MUST** ask when a requirement is ambiguous *and* the decision is hard to reverse. For a reversible choice, decide, record it in the plan's decision log, and continue - the user is not the blocker for choices the rules already settle.
- **SHOULD** note anything discovered outside the current scope in the phase file that owns it, not in the code.

## 10.12 Never loosen a rule to pass

- **MUST NOT** loosen a rule, a lint ruleset, a formatter config, a type (no `any`, `@ts-ignore` or `eslint-disable` to pass a check), a test or a guard script to make code pass. Fix the code.
- **MUST NOT** add a file to a lint allowlist or design backlog; those lists only shrink, and a file leaves the list once it is clean.
- A rule is wrong only if its source is wrong. **MUST** fix the source document first, with the URL it was verified against, then the rule, then the guard - in that order.
- **MUST** record a rule change the user states as general in the brain (procedure in `../CLAUDE.md`), not in a repo's copy; a project-specific exception goes in that project's profile. Superseded 2026-11-10: was "and re-sync" (see §10.14).
- **MUST NOT** mark a checklist item complete you did not run, and **MUST NOT** invent an API, a parameter, a hook name or a version number. Look it up or ask.

## 10.13 Work hierarchy approval and project tracker

Applies to every project on this machine, new or already built. Format: `../templates/project-tracker.md`. Owner account and access state: `../machine/workspace.md` §7.

- **MUST** show the work hierarchy in chat and wait for the user's explicit approval before starting a new project, the first work on an existing project, a new module, or a change to an approved flow. The hierarchy runs from the product to each role (super admin first), that role's modules and what the role can do in each, then the launch items from top to end. For an existing app, derive it from the code.
- **MUST NOT** write code or tracker rows for that work until it is approved. When the user asks for changes, show the corrected hierarchy again.
- **MAY** skip approval for a small bug fix that changes no flow. It is still logged.
- **MUST** keep one Google spreadsheet per GitHub repo, listed in `../projects/trackers.tsv`, with the tabs Dashboard (always first), Project Modules and Daily Log. A product split across repos gets one spreadsheet per repo, and each Dashboard links the related repos. Folders with no GitHub remote and backup folders get none unless the user asks.
- **MUST** update Project Modules and Daily Log in the same unit of work that changes the status, and include other people's commits made since the last update. The Daily Log starts on the day the tracker is created; history is not backfilled unless the user asks.
- **MUST** mark an item Completed only with proof: a merged PR, a check that was run, or the user's confirmation. Reading code shows something is built, not that it works. An item only a live check can confirm stays Not verified until checked.
- **MUST NOT** put a password, key, token or other secret in a tracker. Record the provider and the status only.
- **MUST** say so plainly when a tracker could not be updated (10.8), and **MUST NOT** report it as updated.

## 10.14 Rules live in the controller only

- **MUST NOT** create, copy or sync an `engineering-rules/` folder (core files, stack packs or a README) into any project, new or existing. The controller is the single copy, loaded in every session; `checks/new-project.sh` does not create one.
- **MUST NOT** offer `checks/sync-rules.sh --write`; run it only when the user explicitly asks for that repo. The dry run may report drift in legacy repos.
- **MUST** point project files (AGENTS.md, CLAUDE.md, plans, PR template) at the controller (`~/Prahadeesh/controller`, the `[brain]` brief) instead of a local rules folder.
- Legacy repos that already carry `engineering-rules/` keep it until the user asks to remove it; for Claude the controller wins over that copy.

## Sources

- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/08-workflow-and-verification.md
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/README.md
- private/git-repo/claredesk/wordpress/claredesk/CLAUDE.md
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/checks/gates.sh
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/checks/session-brief.sh
- private/git-repo/claredesk/wordpress/claredesk/.claude/settings.json (hook wiring only)
- private/git-repo/claredesk/wordpress/claredesk/plans/01-foundation-and-tooling.md (checklist and guard format)
- private/git-repo/claredesk/booking/AGENTS.md
- private/git-repo/claredesk/booking/CLAUDE.md
- private/git-repo/claredesk/booking/.github/pull_request_template.md
- private/git-repo/claredesk/booking/docs/tech-stack-recommendation.md
- private/git-repo/claredesk/booking/docs/allowed-apis.md
- private/git-repo/claredesk/booking/plans/00-master.md, plans/01-foundation.md, plans/12-operator-desk.md (plan structure)
- private/git-repo/claredesk/trionex/AGENTS.md
- private/git-repo/claredesk/trionex/plan/README.md
- private/git-repo/claredesk/trionex/docs/adr/0001-tech-stack.md, docs/adr/0003-multi-tenancy.md
- development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md
- development-team/git-repo/s22-internal-projects/tournament/dropin-tournament-app/CLAUDE.md
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/AGENTS.md, README.md, docs/adr/0001-monorepo-with-turborepo-and-pnpm.md
- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/05-documentation.md, 07-collaboration-and-review.md
- private/git-repo/claredesk/billing/_pre-turborepo-backup/claredesk-billing-backend/CONVENTIONS.md

Consolidated 2026-11-08
