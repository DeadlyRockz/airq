# 07 - Collaboration & Review

Software is a team sport. Reviews and communication keep quality high and knowledge
shared - even when the team is one developer and an AI agent.
Applies to: every change on every repository; §7.6 applies to every agent session. Whether a
repository is solo-maintained (§7.4) is recorded in ../projects/<profile>.md.

## 7.1 Before requesting review

- **MUST** self-review your own diff first - read every line as if someone else wrote it.
- **MUST** ensure the change builds, lints, and passes tests.
- **MUST** pass the responsive/adaptive quality gate (../stacks/responsive-adaptive-ux.md) for
  any UI change, and list the routes, widths, and themes actually rendered.
- **MUST** write a clear PR description (see ./02-version-control.md §2.4).
- **SHOULD** leave inline comments on tricky parts to guide the reviewer.
- **MUST** run the full local gate (./03-testing.md §3.5) and every standing guard, and paste
  the commands and results in the PR.
- **MUST** complete every section of ../templates/pull_request_template.md; an unticked item
  needs a reason, not silence.

## 7.2 As a reviewer

- **MUST** review for correctness, readability, security, and adherence to these rules -
  not personal style preferences already settled by the formatter.
- **MUST** check UI changes against the design system (./09-ui-ux-design.md,
  ../stacks/design-tokens-and-theming.md) and the accessibility rules in **both** light and dark
  themes. A deviation from the design system is a blocking comment, not a nit; a hardcoded
  colour, an arbitrary spacing value or an unlabeled icon button is never approved.
- **MUST** be respectful and specific. Critique the code, not the person. Explain _why_
  and suggest a path forward.
- **SHOULD** distinguish blocking issues from optional nits (prefix nits with `nit:`).
- **MUST** approve only when you understand the change and believe it is safe to merge.
- **SHOULD** respond to review requests within one business day.
- **MUST** verify, not trust, the test plan: re-run at least the commands covering the risky part
  of the change.
- **MUST** block a PR that weakens a test, lint rule or standing guard without a stated reason
  (./03-testing.md §3.4).

## 7.3 As an author receiving review

- **MUST** respond to every comment - resolve, fix, or explain why not.
- **MUST NOT** merge with unresolved blocking comments.
- **SHOULD** treat feedback as about the code, not a personal judgment.

## 7.4 Merging

- **MUST** require at least one approval before merge to a protected branch.
- **MUST** ensure CI is green at merge time.
- **SHOULD** let the author merge once approved, unless the team agrees otherwise.
- Where the project profile marks the repository solo-maintained, the author's completed PR
  checklist, the pasted verification output and green CI stand in for the second approval; the
  profile MUST say so explicitly.
- **MUST** merge with the strategy the project profile records (./02-version-control.md §2.5).

## 7.5 Communication

- **MUST** ask when a requirement is ambiguous rather than guessing.
- **MUST** surface blockers early and visibly.
- **SHOULD** prefer written, async communication for decisions so there is a record.
- **MUST** report status honestly - if something is broken, incomplete, or skipped, say
  so plainly.
- **MUST** ask every question that needs the user's decision as a multiple-choice prompt (the
  AskUserQuestion tool: 2-4 options, the recommended one first and marked "(Recommended)", each
  question self-contained), never as a free-text question in the reply. Batch up to four
  questions per prompt rather than interrupting repeatedly. Superseded 2026-11-10: the earlier
  SHOULD "attach a recommended answer to every question so a one-word reply unblocks the work".
- **MAY** ask in plain text only when no choice tool is available in the session; then number the
  options and mark the recommended one.
- **MUST NOT** claim a check passed, a page rendered or a command succeeded without having run
  it in this session (./10-workflow-and-verification.md).

## 7.6 Working with the AI agent

- **MUST** load, at session start, the brain entry file (../CLAUDE.md), the repo's CLAUDE.md /
  AGENTS.md, the project profile and the plan file for the area being touched before changing
  code (./10-workflow-and-verification.md).
- **MUST** present the plan - and, for a new project, the stack recommendation
  (./08-tech-stack.md §8.1) - for approval before writing code, and **MUST NOT** silently expand
  scope beyond what was approved.
- **MUST** record a general rule the user states ("from now on...") in the matching brain file,
  and a project-specific one in the project profile, in the same session, following the recording
  procedure in ../CLAUDE.md.
- **MUST** end a unit of work with a report: what changed, how it was verified (commands and
  output), what was not done, and open questions - the same content as the PR description.

## Sources

- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/07-collaboration-and-review.md (baseline; byte-identical in 8 of 9 repos)
- private/git-repo/claredesk/billing/claredesk-billing/apps/app/engineering-rules/07-collaboration-and-review.md (UI quality gate before review; both themes; design-system deviations are blocking)
- private/git-repo/claredesk/billing/engineering-rules/07-collaboration-and-review.md (quality gate variant)
- private/git-repo/claredesk/booking/AGENTS.md (§1 required context, §3 definition of done, §4 standing guards) and private/git-repo/claredesk/booking/.github/pull_request_template.md (checklist, test plan)
- private/git-repo/claredesk/trionex/AGENTS.md and development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md (read plan before changing code)
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/00-non-negotiables.md (item 12: verification is run, not asserted)
- Consolidated 2026-11-08
