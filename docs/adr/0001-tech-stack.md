# ADR-<NNNN>: <Short title - a noun phrase or an imperative>

- **Status:** <Proposed | Accepted | Superseded by [ADR-<MMMM>](<MMMM>-<slug>.md) | Deprecated>
- **Date:** <YYYY-MM-DD>
- **Decision log row:** D-<NNN> in `plans/README.md`
- **Supersedes:** <ADR-<KKKK>, or "-">

<!--
Write the ADR BEFORE introducing a new framework, datastore, hosting platform, auth or tenancy
model, or a major pattern (rules 5.3 / 10.3). Backfilling a decision already in force is allowed:
say so in the Status line - "Accepted <date> - retroactive record of a decision taken <date> in
<plan file §>". Never rewrite an accepted ADR's Decision in place; supersede it and link both ways.
File name: docs/adr/<NNNN>-<kebab-case-title>.md, four-digit, sequential.
-->

## Context

<!--
The forces: the requirement, the constraint, the rule that applies, the failure in the legacy
system this corrects. Facts, each with where it was verified (plan §, autopsy item, docs URL).
Two to six short paragraphs or bullets.
-->

## Decision

<!--
What we do, stated so a reader can check the code against it. Name the tables, columns, packages,
ports, directories or commands. Bold the sentences that carry the decision. Where there is a
deliberate carve-out, state it here with its boundary ("time columns are allowed in THIS migration
ONLY").
-->

## Consequences

<!--
What becomes easier; what becomes harder; what must now always be true and the guard, test or grep
that proves it; what cost is accepted deliberately. One bullet each.
-->

## Alternatives considered

<!--
One row each: the alternative and why it lost. Required when more than one option was viable;
otherwise write "None - the rules leave one option."
-->

| Alternative | Why not |
| ----------- | ------- |
| <option>    | <reason> |

## How to verify this decision is still in force

<!--
A command or check a reader can run: a standing guard, a pgTAP test, a lockfile line, a build-output
check, a migration header. If nothing mechanical can prove it, say so and name the review step.
-->

<!--
Brain provenance (delete this comment when copying into a repo):
Sources
- private/git-repo/claredesk/trionex/docs/adr/0001-tech-stack.md
- private/git-repo/claredesk/trionex/docs/adr/0003-multi-tenancy.md
- private/git-repo/claredesk/booking/docs/adr/0007-date-time-handling.md
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/docs/adr/0001-monorepo-with-turborepo-and-pnpm.md
- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/05-documentation.md
Consolidated 2026-11-08
-->
