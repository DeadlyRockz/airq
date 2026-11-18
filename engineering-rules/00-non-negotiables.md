# 00 - Non-negotiables (always loaded)

The hard rules, one line each, with the file and section that holds the detail. Breaking one blocks
the change. Read the numbered file right before the matching activity; the project profile may add
stricter rules but never relaxes these.

## Know before you code
1. Never invent an API, hook, parameter or version: it is in the repo's allowed-APIs list, in the lockfile, or in a doc fetched this session, or it does not exist (10 §10.4).
2. Frameworks newer than training data (Next 16, Expo SDK 56+, Tailwind v4, React 19) are used from bundled or versioned docs, never memory (08 §8.6).
3. Propose the stack and get approval before code; a stack already committed in the repo, and the project's design language, are settled and need an ADR to change (08 §8.1, §8.4).
4. Read the project profile first, then the plan index and the phase file for the area, then the stack packs; implement only the module in front of you. Rules live only in the controller: never create, copy or sync `engineering-rules/` into a project (10 §10.1, §10.11, §10.14).

## Secrets and security
5. No secret, key or `.env` file in code or git; real env files live in `~/Prahadeesh/secrets` and are symlinked; `.env.example` holds keys only; anything ever committed is rotated (04 §4.1, §4.7).
6. Service-role / secret keys never reach a browser or app bundle; verify the built output (04 §4.1, stacks/supabase §2.1).
7. Validate and sanitize every external input at the boundary; parameterised queries only; encode output for its context; never trust client-side validation alone (04 §4.2).
8. Authorisation is enforced on the server for every protected operation; with Supabase that means RLS and a tenant column on every table, re-checked in server code; hiding UI is cosmetic (04 §4.3, stacks/supabase §1.1).
9. Pin dependencies with a committed lockfile, audit before adding or upgrading, never disable TLS/CORS/CSP to "make it work" (04 §4.4).

## Code, commits, review
10. Formatter and linter pass before every commit; no unrelated reformatting mixed with logic; no dead or commented-out code; no TODO without an owner (01 §1.3, §1.5).
11. Every error is handled or explicitly propagated; no silent catch; no stack traces or secrets in user-facing messages (01 §1.6).
12. Strict types; no `any`, no suppression comment without a one-line reason (01 §1.7).
13. Branch per unit of work (`type/short-description`), Conventional Commits in the imperative, never commit to a protected branch, never force-push shared history (02 §2.1, §2.2, §2.5).
14. Every change to a protected branch goes through a PR under ~400 lines that states what, why, how it was tested (commands run) and risks; CI green before review and at merge (02 §2.4, 07 §7.4).
15. Reviewers block on correctness, security, rule deviations and design-system deviations in both themes; a hardcoded colour or an unlabelled icon button is never approved (07 §7.2).
16. Status is reported honestly: broken, incomplete or skipped is said plainly (07 §7.5, 10 §10.8).

## Tests and verification
17. Tests accompany every feature and fix; a bug gets a failing regression test first; tests are isolated, deterministic and named for the behaviour (03 §3.1-3.3, §3.5).
18. Never delete, weaken or skip a test, lint rule, guard grep or CI job to go green; narrow a guard only deliberately, with the reason in the PR (03 §3.4, 10 §10.12).
19. Generated artefacts (database types, OpenAPI clients, edge bundles) are regenerated and committed in the same change; CI checks `git diff --exit-code` (03 §3.6).
20. Permissions, roles and lookup rows added in code or migrations are seeded in the same change (seed parity) (stacks/supabase §1.5).
21. Verification is run and its output pasted, never asserted; "should pass" is not a result; skipped checks are named with the reason (10 §10.7).

## Architecture and docs
22. Separation of concerns, no circular or upward dependencies, third-party libraries behind thin adapters at core boundaries, one obvious source of truth per state (06 §6.1-6.3).
23. Configuration is externalised; one build artefact across environments (06 §6.4).
24. An ADR precedes a new framework, datastore, major pattern or native-code dependency, and when an ADR premise changes (05 §5.3, 06 §6.6, 10 §10.3).
25. Docs are part of done: README, plan, ADR or runbook updated in the same change; a change that alters behaviour described in a plan updates the plan (05 §5.5, 10 §10.2).
26. Every exported function, hook, service method and component carries a usage header (purpose, params, returns, throws, example) (11 §11.2).
27. New dependency: on the allowed-APIs list, with justification and Never cases, in the same PR (10 §10.4).

## UI, data and product behaviour
28. Colours are semantic tokens only; spacing, sizes and radii on the ladder; type on the scale with the floor the profile sets; no arbitrary bracket values; one 1px border; one radius token on every surface; no `uppercase` styling, no tracking or kerning; bold only on the page title, semibold only on section titles and stats (09 §9.0, §9.2-9.4, §9.6, §9.11).
29. Both light and dark themes always; dark mode is its own elevation model with a contrast test over every token pair; touch targets >= 44pt; WCAG 2.2 AA; colour never the only carrier of meaning (09 §9.4, §9.7).
30. Every component designs all its states and every data view ships loading, empty, error and success (09 §9.8, 11 §11.5).
31. Reuse the shared UI package before writing a lookalike; promote anything used twice (09 §9.9, 11 §11.1).
32. Business timezone is authoritative for display (store UTC); dates, money and phones format through one shared module; money is integer minor units, phones E.164 (11 §11.3, §11.4).
33. In pnpm repos use pnpm, never npm or yarn; in Expo apps add packages with `npx expo install`; packages move with the SDK (stacks/monorepo §2.2, stacks/expo-react-native §1).

## Working with the user
34. A standing preference or rule the user states is recorded in the controller the same turn and confirmed in one line (../CLAUDE.md "Recording").
35. Ask when a requirement is ambiguous, always as a multiple-choice prompt (AskUserQuestion, recommended option first), never as free text; surface blockers early; never guess silently (07 §7.5).
36. Never loosen a rule to make code pass; a rule changes only when its source is wrong, and the change is logged (10 §10.12).
37. Show the work hierarchy and wait for approval before a new project, the first work on an existing one, a new module or a flow change; keep each GitHub repo's Google spreadsheet (Dashboard, Project Modules, Daily Log) current, with Completed only on proof (10 §10.13).

## How to use
Read the project profile first, then the stack packs the session brief names, then the detailed core file before the matching activity. Section numbers above point into `core/01` to `core/11` and `stacks/*`.

## Sources
- Digest of core/01-11 and stacks/{supabase,monorepo-pnpm-turborepo,expo-react-native}.md as written 2026-11-08/09; tone from private/git-repo/claredesk/wordpress/claredesk/engineering-rules/00-non-negotiables.md. Consolidated 2026-11-09.
