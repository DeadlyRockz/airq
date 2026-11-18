# 02 - Version Control

Git history is documentation. Keep it clean, honest, and reviewable.
Applies to: every repository on this machine. The merge strategy (§2.5), protected branches
beyond `main`, and any extra branch prefixes are set per project in ../projects/<profile>.md.

## 2.1 Branching

- **MUST NOT** commit directly to `main` (or the default/protected branch).
- **MUST** create a branch per unit of work, named `type/short-description`, e.g.
  `feat/user-login`, `fix/null-cart`, `chore/bump-deps`. `feat/`, `fix/` and `chore/` are the
  prefixes in use across this user's repos; any Conventional Commit type (§2.2) is allowed.
- **SHOULD** keep branches short-lived - rebase or merge from `main` frequently to
  avoid large, painful merges.
- Protected branches are `main` plus any `develop` / `qa` branch the project profile lists; CI
  runs on every PR and on every push to each of them.
- An AI agent **MUST NOT** commit, push, rewrite history or open a PR unless the user asked for
  it in the current session. If asked while on a protected branch, it **MUST** create a branch
  first.

## 2.2 Commits

- **MUST** make each commit a single logical change that builds and passes tests on its
  own.
- **MUST** write commit messages in the [Conventional Commits](https://www.conventionalcommits.org)
  style:

  ```
  <type>(<optional scope>): <imperative summary, <=72 chars>

  <optional body: what and why, not how>

  <optional footer: BREAKING CHANGE:, refs #123>
  ```

  Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
  `chore`, `revert`.

- **MUST** use the imperative mood: "add cache", not "added" or "adds".
- **MUST NOT** bundle unrelated changes into one commit.
- **SHOULD** explain _why_ in the body when the change is not self-evident.
- **MUST** commit the regenerated output in the same change when a change touches generated
  files (database types, OpenAPI clients, lockfiles, framework-written agent-docs blocks). CI
  regenerates and runs `git diff --exit-code`; drift fails the build (./03-testing.md §3.6).
- **MUST** run the formatter, linter, typecheck and tests on the state being committed, not on
  a dirty tree with unstaged fixes.

## 2.3 What must never be committed

- **MUST NOT** commit secrets, credentials, API keys, tokens, or `.env` files.
- **MUST NOT** commit generated artifacts, build output, or dependency folders
  (`node_modules`, `dist`, `target`, `.next`, `.expo`) - add them to `.gitignore`.
- **MUST NOT** commit large binaries without a deliberate decision (use LFS if needed).
- **MUST** run `git -C <repo> check-ignore -v <file>` on every env or credential file
  (including the symlinks into the secrets store) before the first commit of a repo; it MUST
  print a match. See ./04-security.md §4.7.
- **MUST NOT** commit a `.mcp.json` that carries tokens; one that only lists commands may be
  tracked (./04-security.md §4.7).

## 2.4 Pull requests

- **MUST** open a PR for every change reaching a protected branch.
- **MUST** keep PRs small and focused - ideally under ~400 changed lines. Split larger
  work, or justify the size in the description.
- **MUST** include in the PR description: what changed, why, how it was tested, and any
  risks or follow-ups. Use the shape in ../templates/pull_request_template.md: What changed ·
  Why (plan section / ticket / ADR) · How it was tested · Risks and follow-ups · rules checklist.
- **MUST** write the test plan as the commands actually run and what they returned. "CI is
  green" is not a test plan.
- **MUST** link the related issue/ticket, and the plan phase/section or ADR when the change
  alters an architectural premise (./05-documentation.md §5.3).
- **MUST** ensure CI is green before requesting review.
- **MUST** list every new dependency in the project's allowed-APIs document in the same PR,
  with a one-line justification and its "Never" cases; otherwise the PR is blocked.
  See ./10-workflow-and-verification.md and ../templates/allowed-apis-template.md.
- **MUST** regenerate generated types/clients and show `git diff --exit-code` clean before
  requesting review.
- **MUST** call out under "Risks and follow-ups" any test, lint rule or standing guard that was
  deliberately narrowed, with the reason. Narrowing with a reason is allowed; silent weakening
  is not (./03-testing.md §3.4).

## 2.5 History hygiene

- **MUST NOT** force-push to a shared branch others are working on.
- **SHOULD** squash trivial "fix typo" / "address review" commits before merge so
  history stays meaningful.
- **MUST NOT** rewrite history on `main`.
- **MUST** follow the merge strategy recorded in the project profile (squash-merge, or merge
  commits with a linear rebase-first history). When the profile is silent, **SHOULD**
  squash-merge so each PR lands as one Conventional Commit whose subject is the PR title.
- **MUST** undo merged work on a protected branch with `git revert`, never with a reset.

## 2.6 Repository hygiene

- **MUST** commit the lockfile and set `packageManager` in `package.json`; CI installs with
  `--frozen-lockfile` (../stacks/ci-github-actions.md).
- **MUST** keep `.gitignore` covering `.env*` (allow-listing `.env.example`), dependency
  folders, build output, coverage and OS files; start from ../templates/gitignore.
- **SHOULD** tag releases `vMAJOR.MINOR.PATCH` and keep `CHANGELOG.md` for user-facing
  releases (./05-documentation.md §5.4).

## Sources

- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/02-version-control.md (baseline; byte-identical in 8 of 9 repos)
- private/git-repo/claredesk/booking/AGENTS.md (§3 definition of done, §4 standing guards, §5 non-negotiables)
- private/git-repo/claredesk/booking/.github/pull_request_template.md (PR shape, test-plan wording, narrowing rule)
- development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md and private/git-repo/claredesk/trionex/AGENTS.md (commit regenerated types)
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/.github/workflows/ci.yml (protected branches `main`, `develop`, `qa`; frozen lockfile)
- secrets/README.md (`git check-ignore` before committing, `.mcp.json` handling)
- Consolidated 2026-11-08
