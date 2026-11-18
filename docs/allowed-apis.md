# Allowed APIs + Tech Stack

Version-pinned API surface for this repo: **use this / never this**, per technology. Binding
alongside the brain rules (AGENTS.md §1.1) and `plans/standards.md`; referenced by root `AGENTS.md` §1.2.
An API that is not in this file and not in an official doc page fetched this session does not
exist. A new dependency or API is added here **in the same PR** that introduces it: version from
the lockfile, Use, Never, a one-line justification, the documentation URL and the date it was read.

Versions below were resolved on <YYYY-MM-DD> with `<pnpm ls -r --depth 0 | composer show | npx expo install --check>`.
Nothing here is pinned from memory or from plan prose. **When this file and the lockfile disagree,
the lockfile wins - update this file in the same PR.** A library with a full Use/Never section but
no resolved version is marked `(planned)` and listed in the last section.

## <Web framework> <major.minor> (<which apps>)

- **Use**: <the APIs, file conventions and patterns this repo relies on, each with where it is
  already used - "copy from `<path>`">.
- **Never**: <the APIs, patterns and config the rules forbid, each with the reason or the rule
  number>.
- Docs: <official URL> (read <YYYY-MM-DD>). Gaps: <what the docs do not say, and how the code
  degrades there>.

## <Backend framework> <major.minor> (`apps/<backend>`)

- **Use**: <request-handling layers, config validation, DTO validation at the boundary, the shared
  authorization helpers every scoped route must call>.
- **Never**: <data access from a controller; a second ad hoc authorization check; business logic in
  the database beyond CHECK/trigger helpers>.
- Docs:

## <Database / BaaS client> <major.minor> (`<DB_PACKAGE>`)

- **Use**: <client factories and where each runs; the only key allowed in a browser; the generated
  types path and the regenerate command>.
- **Never**: <the service-role / secret key in any client bundle; deprecated helper packages; an ORM
  generator as the migration source when migrations are SQL-first>.
- Docs:

## <Styling / UI library> <major.minor> (shared UI package)

- **Use**: <CSS-first configuration, the token file, the component CLI run from inside the UI
  package only, `@repo/ui/components/<name>` imports>.
- **Never**: <a `tailwind.config.*` file; raw hex/rgb outside the token set; a per-app
  `components/ui`; a second icon set, toast library or theme switcher>.
- Docs:

## Formatting - date-fns <x.y> + @date-fns/tz <x.y> + libphonenumber-js <x.y> (`<FORMATTING_PACKAGE>`)

- **Use**: only inside `<FORMATTING_PACKAGE>` (rule 11.4) - `formatDate` / `formatTime` /
  `formatDateTime` / `formatMoney` / `formatPhone` / `parsePhone`; `TZDate` or `{ in: tz(zone) }`
  for every business-timezone operation; E.164 storage and national display for phones.
- **Never**: `toLocale*` / raw `Intl.*` / hand-rolled phone regexes anywhere; direct imports from
  app code; `new Date()` local-time arithmetic on business data; a second date or phone library.
- Docs:

## <Third-party SDK behind a port> <x.y> - <INSTALLED | (planned - propose ^x.y.z)>

<!--
One section per payment, messaging, maps, storage or analytics SDK. Name the port it sits behind
and the single directory allowed to import it, so `git grep -rn "<sdk>" <src>` proves the
confinement. Record what the official docs did NOT say rather than guessing, and what the code does
in that gap.
-->

- **Use**: <constructor and the credential source; the exact calls with their documented
  parameters; the idempotency handle; where the raw body is needed for signature checks>.
- **Never**: <trusting client-reported amounts or redirects; skipping signature verification;
  letting the SDK's `any` types escape the adapter; a second provider beside this one without an
  ADR; a method the docs do not list - a "should exist" method is a bug, not a placeholder>.
- Docs: <URL> (read <YYYY-MM-DD>). Gaps: <...>.

## Platform / HTTP services with no package

<!--
Tile servers, geocoders, public APIs. Record the usage policy (rate limit, attribution, licence),
the single module allowed to call each one, and the env var that points it at a self-hosted
instance when volume outgrows the public one.
-->

- **Use**:
- **Never**: calling it from anywhere but `<module>`; a per-keystroke or batch lookup; storing or
  re-publishing results the licence does not permit.

## Repo toolchain - already in use

<!--
Task runner, formatter, linter, test runners, type-generation tools, with versions. One tool per
role: name the runner each workspace uses and never add a second in a role.
-->

- **Use**: exactly one task runner, one formatter, one linter, one Postgres driver, one test runner
  per layer (<unit runner> for <workspaces>, <browser e2e> for `<e2e dir>`); a workspace with no
  runner yet takes the one its layer already uses.
- **Never**: a second tool in any of these roles; `npm` / `yarn` in place of the pinned
  `packageManager`; a generated file hand-edited.

## Allowed SQL functions (`CREATE OR REPLACE FUNCTION` in migrations)

<!-- SQL-first repos only. A function in a migration is a CHECK or trigger helper SQL cannot
     express otherwise - never business logic. Add a row in the same PR as the migration. -->

| Function | Migration | Why it exists |
| -------- | --------- | ------------- |
|          |           |               |

## Not yet in this repo

| Package  | Proposed version | Lands in                               |
| -------- | ---------------- | -------------------------------------- |
| `<name>` | `^x.y.z`         | Phase <NN> (`plans/<NN>-<topic>.md`)   |

<!--
Brain provenance (delete this comment when copying into a repo):
Sources
- private/git-repo/claredesk/booking/docs/allowed-apis.md
- private/git-repo/claredesk/booking/docs/tech-stack-recommendation.md
- private/git-repo/claredesk/wordpress/claredesk/CLAUDE.md
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/08-workflow-and-verification.md
Consolidated 2026-11-08
-->
