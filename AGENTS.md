# AGENTS.md - required reading for every agent and contributor

This file is the entry point for anyone - human or agent - touching this repository. Load the
documents in [§1 Required context](#1-required-context) **before** producing or changing code,
and satisfy [§3 Definition of done](#3-definition-of-done) before opening a pull request.
`CLAUDE.md` at the repo root exists only to redirect here. This file is the source of truth.

The general engineering rules are NOT copied into this repository. They live in the engineering
brain (`~/Prahadeesh/controller`), which Claude loads in every session on the owner's machine. Do not
add an `engineering-rules/` folder here: a general rule change goes to the brain; a project-specific
exception is recorded in §6 of this file and in the project's brain profile.

Precedence when two sources disagree: **a direct instruction from the user → engineering rules →
project config (linter, formatter, CI) → personal preference.** The more specific rule wins; if it
is still unclear, raise it in review rather than guessing.

---

## 1. Required context

Load **all** of the following. They are small; there is no excuse for skipping one.

### 1.1 Engineering rules - the brain, not this repo

Read `~/Prahadeesh/controller/core/00-non-negotiables.md` (always in force), then the core file and
stack packs the `[brain]` session brief names before the matching activity: 01 code quality,
02 version control, 03 testing, 04 security, 05 documentation, 06 architecture, 07 review,
08 tech stack, 09 UI/UX, 10 workflow and verification, 11 cross-cutting standards.

### 1.2 Allowed APIs - `docs/allowed-apis.md`

The closed, version-pinned list of libraries, SDKs and platform APIs this project may use, with a
**Never** list per technology. An API that is not in it and not in an official doc page fetched
this session does not exist. A dependency not on the list **MUST** be added in the same PR that
introduces it, with a one-line justification - otherwise the PR is blocked.

### 1.3 Cross-cutting standards - `plans/standards.md`

The project-specific instantiation of rule 11: which package formats dates, money and phones
(`<FORMATTING_PACKAGE>`), which shared composites exist, which business settings drive display.
Binding for every phase, not only the one you are working on.

### 1.4 The current phase file

Work is organised as numbered phase plans under `plans/` (index: `plans/README.md`). Load the
plan file for the phase you are working on and treat its **Verification checklist** and
**Anti-pattern guards** as binding acceptance criteria. If your change alters behaviour described
there, update the plan in the same change.

Architecture decisions live in `docs/adr/`. A decision that changes an ADR's premise **MUST**
produce a new ADR or supersede one (rules 5.3 / 10.3).

---

## 2. Repository map

```
apps/
  <APP_1>/        <what it is> (<framework>, port <PORT>)
  <APP_2>/        <what it is>
  <MOBILE_APP>/   <Expo / React Native app, if any>
packages/
  ui/             <UI_PACKAGE> - shared component library + design tokens
  <FORMATTING_PACKAGE_DIR>/   the ONLY place date/money/phone formatting is implemented
  <DB_PACKAGE_DIR>/           generated database types + client factories
  eslint-config/, typescript-config/   shared config
<DB_DIR>/         migrations/, <SEED_FILE>, local config
docs/             allowed-apis.md, adr/, runbooks/
plans/            phase plans + standards.md
```

### 2.1 Commands

| Command                          | What it does                                              |
| -------------------------------- | --------------------------------------------------------- |
| `<PM> dev`                       | all apps in watch mode                                    |
| `<PM> lint`                      | ESLint, `--max-warnings 0` everywhere                     |
| `<PM> typecheck`                 | `tsc --noEmit` per workspace                              |
| `<PM> build`                     | production build                                          |
| `<PM> test`                      | unit + integration tests                                  |
| `<PM> test:e2e`                  | browser / device e2e                                      |
| `<PM> format` / `format:check`   | Prettier write / check                                    |
| `<GEN_TYPES_COMMAND>`            | regenerate generated types (database, API clients)        |
| `<DB_RESET_COMMAND>`             | reset the local database: migrations + seed               |
| `<GATES_COMMAND>`                | run every automatable gate; prints PASS / FAIL / SKIP     |

Node `<NODE_RANGE>`. The package manager is pinned by `package.json` `packageManager` - do not
install with anything else. In the mobile app, add packages with `npx expo install` so versions
match the SDK.

---

## 3. Definition of done

A change is **not done** until all of these hold. This mirrors `.github/pull_request_template.md`;
CI enforces the mechanical subset.

1. `<PM> lint`, `<PM> typecheck`, `<PM> build` and `<PM> test` all pass.
2. The formatter has been run on every file you touched, and **no unrelated reformatting is mixed
   into a logic change**.
3. Tests exist for the behaviour you added or fixed; no test was deleted or weakened to pass.
4. No secret, key, token or `.env` file is committed; the server-only key reaches no browser or app
   bundle - verified against the built output.
5. Every new dependency is on the Allowed list in `docs/allowed-apis.md`, added in the same PR.
6. The `plans/standards.md` items hold for any UI or API surface you touched.
7. **Seed parity** - a change that adds a permission, role or lookup row updates `<SEED_FILE>` in
   the same PR. An unseeded permission fails silently at runtime and takes every integration spec
   with it.
8. Generated types are regenerated and committed; `git diff --exit-code` is clean after
   `<GEN_TYPES_COMMAND>`.
9. Docs are part of done: the phase plan, an ADR or a runbook is updated when the change alters an
   architectural premise or an operational procedure.
10. The phase verification checklist and the standing guards (§4) were **run** and their output
    pasted into the PR - not asserted. Skipped checks are named with their reason.

---

## 4. Standing guards

Grep-able invariants the plans assert. Do not weaken one to make it pass - narrow it deliberately
and say why in the PR.

| Guard                                                                                   | Must return            | Why                                                                                                  |
| --------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `git grep -i <LEGACY_NAME> -- apps packages <DB_DIR>`                                   | empty                  | shipped code never touches the legacy project; prose in `plans/` and `docs/adr/` is the exception    |
| `git grep -in <OFF_PALETTE_COLOUR> -- packages apps`                                    | empty                  | primary is `<PRIMARY_TOKEN>` (rule 09); tokens live in `packages/ui/src/styles/globals.css`          |
| `git diff --exit-code` after `<GEN_TYPES_COMMAND>`                                      | clean                  | generated types must not drift from the schema or the OpenAPI document                               |
| `git grep -rn "<THIRD_PARTY_SDK>" apps/<BACKEND>/src`                                   | only `<ADAPTER_DIR>/`  | a third-party SDK stays behind its adapter (rule 06)                                                 |
| `git grep -nE "toLocale(Date\|Time)?String\|Intl\." -- apps packages ':!<FORMATTING_PACKAGE_DIR>'` | empty       | formatting lives in one package (rule 11.4)                                                          |

---

## 5. Non-negotiables

- **MUST NOT** commit secrets, `.env` files or credentials. `.gitignore` ignores `.env*` and allows
  only `.env.example` (keys, never values).
- **MUST NOT** ship a server-only / service-role key into any browser or app bundle - verify the
  built output, not just the source.
- **MUST NOT** weaken or delete a test, lint rule, type or verification grep to make CI green.
- **MUST NOT** mix a wholesale reformat with a logic change.
- **MUST NOT** add a dependency without listing it in `docs/allowed-apis.md` in the same PR.
- **MUST NOT** invent an API, parameter, hook name or version. Look it up or ask.
- **MUST** open a PR for every change reaching a protected branch, keep it under ~400 changed
  lines, and describe what changed, why, how it was tested and the risks.
- **MUST** report honestly: what ran, what it returned, what was skipped and why.

---

## 6. Project-specific facts

| Fact                      | Value                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Tenant column             | `<organization_id \| business_id \| club_id>` on every tenant-owned table; RLS on every table                |
| Database access mode      | `<MCP server only \| CLI \| local stack>` - the others are forbidden; if unavailable, stop and report       |
| Business timezone source  | `<TABLE>.timezone` (IANA), inherited by `<venues \| sites>` when null                                        |
| Money                     | integer minor units; currency `<CURRENCY>`                                                                   |
| Formatting package        | `<FORMATTING_PACKAGE>`                                                                                       |
| Design tokens             | `packages/ui/src/styles/globals.css`; mobile mirror `<MOBILE_TOKENS_PATH>` - change both in one commit       |
| Framework version notes   | <e.g. Next.js 16: read `node_modules/next/dist/docs/` before using an API; heed deprecation notices>          |
| Legacy system             | `<LEGACY_NAME>` - never read from or written to by shipped code                                              |

<!--
Brain provenance (delete this comment when copying into a repo):
Sources
- private/git-repo/claredesk/booking/AGENTS.md
- private/git-repo/claredesk/booking/CLAUDE.md
- private/git-repo/claredesk/trionex/AGENTS.md
- development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/AGENTS.md
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/README.md
- private/git-repo/claredesk/wordpress/claredesk/CLAUDE.md
Consolidated 2026-11-08
-->
