# 01 - Code Quality

Code is read far more often than it is written. Optimize for the next person who opens
the file - usually a future Claude session with no memory of this one.
Applies to: every language and repository on this machine. A project profile
(../projects/<profile>.md) may override only the formatter defaults in §1.5 and the prefix in §1.1.

## 1.1 Naming

- **MUST** use descriptive, intention-revealing names. `activeUserCount`, not `n` or `tmp`.
- **MUST** follow the naming convention already used in the file/language
  (`camelCase`, `snake_case`, `PascalCase`) - consistency beats personal taste.
- **MUST NOT** use abbreviations that are not widely understood. `config` is fine;
  `cfgMgrSvc` is not.
- **SHOULD** name booleans as predicates: `isEnabled`, `hasAccess`, `canRetry`.
- **SHOULD NOT** encode type into the name (`strName`, `arrItems`) unless the language
  convention demands it.
- **MUST** prefix every global symbol (functions, classes, constants, hooks, CSS blocks, option
  keys, DB entries) with the project prefix when the platform shares a global namespace
  (WordPress, browser globals). The prefix is recorded in the project profile; never re-prefix
  bundled third-party scripts. See ../stacks/wordpress-woocommerce.md.

## 1.2 Functions and methods

- **MUST** do one thing. If a function needs "and" to be described, split it.
- **SHOULD** keep functions under ~40 lines and ~4 parameters. Beyond that, group
  parameters into an object/struct or extract a helper.
- **MUST** return early to avoid deep nesting (guard clauses over nested `if`).
- **MUST NOT** have side effects that the name does not imply. `getUser()` must not
  write to the database.

## 1.3 Structure and readability

- **MUST** keep one clear responsibility per file/module.
- **SHOULD** order code top-down: public/entry points first, helpers below.
- **MUST NOT** leave commented-out code in a merged change. Delete it; version control
  remembers.
- **MUST NOT** leave `TODO`/`FIXME` without a ticket reference or an owner.
- **MUST NOT** leave debug output (`console.log`, `print`, `var_dump`, `dd()`) in a merged
  change; use the project's logger with a level.
- **MUST NOT** create a second home for something that already has one: no `components/ui`
  inside an app when the shared UI package (`@repo/ui` or equivalent) exists, no local date or
  money formatter when the shared formatting package exists. See ./06-architecture.md §6.8 and
  ./11-cross-cutting-standards.md.

## 1.4 Complexity

- **SHOULD** prefer the simplest solution that solves the actual problem. Do not build
  for imagined future requirements (YAGNI).
- **MUST NOT** duplicate logic more than twice - extract on the third occurrence (DRY),
  but not before the pattern is clear.
- **SHOULD** avoid clever one-liners when a plain version is clearer.

## 1.5 Formatting

- **MUST** run the project's formatter and linter before committing. No manual
  formatting debates.
- **MUST NOT** mix unrelated reformatting with a logic change in the same commit - it
  hides the real diff.
- **MUST** treat the committed formatter config (`.prettierrc` or equivalent) as the arbiter:
  never hand-format against it and never change it inside a feature change.
- **MUST** keep lint at zero warnings (`eslint --max-warnings 0` or the language equivalent);
  a warning is a failure in CI.
- **MUST NOT** silence a lint or type error with a blanket disable, `any` or `@ts-ignore` to
  make a build pass. A targeted `eslint-disable-next-line` / `@ts-expect-error` **MUST** carry a
  reason on the same line. Narrowing a rule needs a stated reason in the PR (./03-testing.md §3.4).
- Default formatter settings for a new project (the project profile may override): Prettier 3,
  `printWidth: 100`, `tabWidth: 2`, `semi: true`, double quotes, `trailingComma: "es5"`,
  `endOfLine: "lf"`, plus `prettier-plugin-tailwindcss` with `tailwindFunctions: ["cn", "cva"]`
  whenever Tailwind is present. Start from ../templates/prettierrc.json.

## 1.6 Error handling

- **MUST** handle or explicitly propagate every error. No silent `catch {}`.
- **MUST** fail loudly and early with a clear message; never swallow exceptions to make
  a test pass.
- **MUST NOT** expose internal stack traces or secrets in user-facing error messages.
- **MUST NOT** use error-suppression operators or blanket exception swallowing (`@` in PHP,
  bare `except:`, `catch (e) {}`); handle the error or let it propagate with context.
- **MUST** fail at startup, not at first use, when required configuration is missing
  (./06-architecture.md §6.4).
- **MUST** map internal failures to client-safe error shapes at the boundary (problem details
  or typed error codes), never raw driver, database or framework messages.

## 1.7 Type safety and correctness

- **MUST** use strict static typing (`"strict": true` in TypeScript, type hints + Pydantic in
  Python, static types elsewhere) and keep `tsc --noEmit` clean in every workspace.
- **MUST NOT** use `any`, unchecked casts or non-null assertions to make the compiler agree;
  narrow the type or validate the value.
- **MUST** validate external input at the boundary with a schema (zod, class-validator,
  Pydantic) and derive the static type from the schema rather than declaring both.
- **MUST NOT** call an API, option, hook or parameter that you have not confirmed in the
  installed version's bundled docs or type signature in this session. A plausible parameter that
  silently does nothing is the most common failure mode of generated code.
  See ./08-tech-stack.md §8.6 and ./10-workflow-and-verification.md.
- **MUST NOT** add a parameter you have not seen in the signature. Signature in the reference,
  or fetched today - otherwise it does not exist.

## 1.8 Definition of "clean"

A change is clean when: it compiles and typechecks, the linter/formatter pass with zero
warnings, names read clearly, there is no dead code or debug output, and a reviewer can
understand it without asking the author.

## Sources

- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/01-code-quality.md (baseline; byte-identical in 8 of 9 repos)
- private/git-repo/claredesk/booking/AGENTS.md (§2.1 commands, §3 definition of done, §5 non-negotiables)
- private/git-repo/claredesk/booking/.github/pull_request_template.md (code-quality checklist)
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/00-non-negotiables.md (items 1-3, 5; banned constructs)
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/AGENTS.md (shared UI package, no per-app `components/ui`)
- Formatter defaults observed in `.prettierrc` of DropinPOS/DropinPOS, claredesk/booking, claredesk/trionex, s22-tournament, claredesk/wacrm
- Consolidated 2026-11-08
