# 05 - Documentation

If it is not written down, it does not exist. Documentation lowers the cost of every
future change - and for an AI agent it is the only memory that survives the session.
Applies to: every repository. Agent-facing files (CLAUDE.md, AGENTS.md, plans, ADRs, the
allowed-APIs document, runbooks) are documentation and follow these rules.

## 5.1 Code comments

- **MUST** explain _why_, not _what_. The code shows what; comments justify decisions,
  trade-offs, and non-obvious constraints.
- **MUST NOT** write comments that merely restate the code (`i++ // increment i`).
- **MUST** update or delete comments when the code changes - a wrong comment is worse
  than none.
- **SHOULD** document public functions/APIs with the language's doc convention
  (JSDoc/TSDoc, docstrings) describing params, return, and thrown errors.
- **MUST** put a TSDoc usage header (purpose, params, return, thrown errors, `@example`) on
  every exported function in a TypeScript package (./11-cross-cutting-standards.md).
- **SHOULD** cite the documentation source (URL or bundled-docs path) in a comment when using a
  non-obvious framework API, so the next reader can verify it (./08-tech-stack.md §8.6).

## 5.2 README

- **MUST** keep a top-level `README.md` that covers: what the project is, prerequisites,
  how to install, how to run, how to test, and how to configure (env vars).
- **MUST** keep setup instructions working - if a step breaks, fix the docs in the same
  PR.
- **MUST** include a commands table (`dev`, `lint`, `typecheck` / `check-types`, `test`,
  `test:e2e`, `build`, `format`, db and type generation) and the required Node and package
  manager versions.
- **MUST** say where the real env files live (the secrets store, ./04-security.md §4.7) and how
  to relink them - key names only, never values.

## 5.3 Architecture Decision Records (ADRs)

- **SHOULD** record significant, hard-to-reverse decisions as short ADRs in
  `docs/adr/NNNN-title.md`: context, decision, consequences.
- **MUST** write an ADR before introducing a new framework, database, or major
  architectural pattern.
- **MUST** write a new ADR, or supersede an existing one, when a decision changes an ADR's
  premise; never edit an accepted ADR's decision in place.
- **MUST** write an ADR before changing a committed stack or design language
  (./08-tech-stack.md, ./06-architecture.md §6.6).
- **MUST** use ../templates/adr-template.md (context, decision, consequences, alternatives
  considered) so ADRs stay comparable across repos.

## 5.4 Plans and change documentation

- **MUST** keep the PR description as the primary record of a change (see
  ./02-version-control.md §2.4).
- **MUST** read the plan file for the area being touched before changing it, and update the plan
  in the same change when behaviour described there changes. Plan structure:
  ./10-workflow-and-verification.md, ../templates/plan-README-template.md,
  ../templates/plan-phase-template.md.
- **MUST** record the as-built choice when implementation diverges from the plan; never
  retro-fit the plan to pretend the divergence was the intent.
- **SHOULD** maintain a `CHANGELOG.md` for user-facing releases.

## 5.5 Keeping docs alive

- **MUST** treat documentation as part of "done" - a feature is not complete until its
  docs are updated.
- **SHOULD** prefer a small number of accurate docs over many stale ones. Delete
  documentation that no longer reflects reality.
- **MUST** update the phase plan, an ADR or a runbook when a change alters an architectural
  premise or an operational procedure.
- **MUST** state plainly what could not be sourced or verified rather than fill a gap with
  invented content; a `(planned)` or "not verified" marker beats a confident guess.
- **MUST NOT** keep two copies of the same truth (e.g. alternatives in both an ADR and a stack
  document); keep one and index the other.

## 5.6 Agent-facing documentation in a repo

- **MUST** keep a small `CLAUDE.md` and/or `AGENTS.md` at the repo root that points to this brain
  and its project profile, states repo facts the brain cannot know (package manager, apps and
  packages map, tenant column, commands, port numbers) and lists the standing guards. Start from
  ../templates/CLAUDE.md and ../templates/AGENTS.md.
- **SHOULD NOT** copy brain rules into a repo; link them. Where a team repo needs an in-repo copy
  for other contributors, the project profile says so and the brain remains canonical.
- **MUST** put project-specific deviations in ../projects/<profile>.md, never as edits to a
  core or stack file.
- **MUST** keep framework-written doc blocks (e.g. the Next.js agent-rules block that `next dev`
  writes into AGENTS.md) committed rather than deleting them from a diff (../stacks/nextjs.md).
- **MUST** keep the allowed-APIs document (../templates/allowed-apis-template.md) and
  `docs/runbooks/` current; a runbook step that breaks is fixed in the same PR.

## Sources

- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/05-documentation.md (baseline; byte-identical in 8 of 9 repos)
- private/git-repo/claredesk/booking/AGENTS.md (§1.2 allowed APIs, §1.3 TSDoc standard, §1.4 ADR supersession, §2.1 commands table, §3.8 docs are part of done)
- private/git-repo/claredesk/booking/.github/pull_request_template.md (docs checklist)
- private/git-repo/claredesk/booking/docs/tech-stack-recommendation.md (as-built divergences, "what this document could not source", no duplicated truth)
- private/git-repo/claredesk/trionex/AGENTS.md and development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md (read and update the plan file; Next.js agent-rules block)
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/AGENTS.md (repo map and "working here" facts in the agent file)
- Consolidated 2026-11-08
