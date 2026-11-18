# 11 - Cross-Cutting Standards

Five standards that apply to every phase of every app, not only the one being built: component-first UI, a usage header on every export, the business timezone as the display authority, one shared formatting module, and four UI states on every data view. The user mandated them on 2026-08-01 for the booking platform; they are generalised here. They extend 01-code-quality.md, 05-documentation.md, 06-architecture.md and 09-ui-ux-design.md, and every one of them is a PR-checklist item (11.6). Static-first routing, mandated alongside them, is Next.js-specific and lives in `../stacks/nextjs.md`.

Applies to: every web, mobile and backend codebase that renders, formats or transports business data. The project profile names the concrete package, columns and components; its repo copy is `plans/standards.md`.

## 11.1 Component-first UI with maximum reuse

- Every piece of UI is a component. Route files (`page.tsx`, a screen file under `app/`) **MUST** only compose components - no raw JSX blocks living inline in pages.
- **MUST** place a component by the ladder below, promote upward, and never duplicate:

| Used by | Lives in |
| --- | --- |
| Both apps, or clearly generic | the shared UI package (`@repo/ui` or equivalent, `packages/ui/src/components/`) |
| 2+ pages within one app | that app's `components/` |
| One page only | colocated next to the route |

- **MUST** check the shared package inventory and the app's `components/` before writing any component, and extend or compose an existing one rather than write a lookalike.
- **MUST** install shadcn primitives into the shared UI package only (its `components.json` wiring); apps import `@repo/ui/components/*`. **MUST NOT** create a `components/ui/` inside an app.
- Shared composites that **MUST** exist in the shared package: `EmptyState`, `ErrorState`, skeleton primitives, theme provider and toggle. Grown over time: `PageHeader`, `DataTable`, `ConfirmDialog`, `PhoneInput`, `DateTimeText` (formats via the formatting module, 11.4).
- Copy-pasting a JSX block between two files is the signal to extract a component (01-code-quality.md, DRY).
- React Native: **MUST** reuse the app's `components/ui/` primitives (text, button, screen wrapper) - never hand-roll a second button; tokens and their web mirror follow `../stacks/expo-react-native.md`.

## 11.2 Usage header on every export

- Every **exported** function, hook, service method and component **MUST** carry a TSDoc/JSDoc header stating what it does and how to use it: a one-line purpose, `@param`, `@returns`, `@throws` when it throws, and a realistic `@example`.
- Non-exported helpers **SHOULD** carry at least the one-line purpose when intent is not obvious from the name; comments explain *why*, not *what* (05-documentation.md §5.1).
- Reviewers **MUST** reject exported functions without this header; CI **MAY** enforce it with a doc-comment lint rule.
- **MUST** update or delete the header when the signature or behaviour changes - a wrong header is worse than none.
- PHP equivalents (file and function docblocks) follow `../stacks/wordpress-woocommerce.md`.

```ts
/**
 * Formats a UTC instant in the business timezone using the business's time format.
 *
 * @param instant - UTC date (ISO string or Date)
 * @param opts - business display prefs + IANA timezone
 * @returns wall-clock string in the business timezone, e.g. "6:00 PM" or "18:00"
 * @example
 * formatTime('2026-08-15T08:00:00Z', { timezone: 'Australia/Melbourne', timeFormat: '12h' })
 * // => "6:00 PM"
 */
export function formatTime(instant: string | Date, opts: FormatTimeOptions): string { … }
```

## 11.3 Business timezone is authoritative

- **Storage MUST be UTC only**: every instant is `timestamptz`, every occupied interval is `tstzrange`. No naive timestamps, no date + time column pairs, no offset columns. The business and each venue, site or branch carry an IANA `timezone` column; a child's null inherits the business's.
- **MAY** store a recurring wall-clock fact (opening hours, pricing windows) as a bare `time` column; the migration header **MUST** declare the carve-out explicitly.
- **Display MUST use the business or venue timezone**, never the viewer's device timezone, for all business data: slots, bookings, schedules, shifts, reports, notifications, receipts. A 6:00 PM Melbourne slot shows "6:00 PM" to a viewer in London. **SHOULD** show the timezone label where ambiguity is possible.
- **Conversion MUST happen only at the boundary**, via `@date-fns/tz` (`TZDate`, `{ in: tz(zone) }`) or the stack's equivalent, inside the formatting module (11.4) and server-side generation code. **MUST NOT** do `new Date()` local-time arithmetic on business data anywhere else; the frontend passes venue-local `YYYY-MM-DD` dates to the API.
- **MUST NOT** loop `addWeeks` / `addDays` off a plain `Date` to materialise a series (the server's zone silently becomes the venue's); **MUST** bound every generation horizon with business config; **MUST** decide and unit-test how a nonexistent (spring-forward) or doubled (fall-back) wall-clock time resolves.
- **MUST** record date/time handling as an ADR in every repo that stores instants (10-workflow-and-verification.md §10.3); storage and the overlap or double-booking guard are the same decision seen from two angles (`../stacks/supabase.md`).

## 11.4 One shared formatting module for dates, money and phones

- All formatting of dates, times, money and phone numbers **MUST** go through one shared module - `packages/utils` (`@repo/utils`) in a monorepo, a single `lib/format/` in a single app - consumed by every web app, the mobile app and the backend (emails, receipts, exports). The profile names it.
- Business-level display settings **MUST** live on the business row, editable in the admin app and seeded with defaults: `date_format` (e.g. `DD/MM/YYYY`), `time_format` (`12h` | `24h`), `phone_country` (default region for phone parsing, e.g. `AU`, `IN`).
- **Dates**: `formatDate` / `formatTime` / `formatDateTime` / `formatWeekday` take the business format and an IANA timezone (11.3).
- **Money MUST be integer minor units** (cents, paise) in storage, transport and arithmetic, with SQL `CHECK` constraints; `formatMoney(minor, currency)` out. **MUST NOT** use floats, `text` columns, `toFixed` arithmetic or client-computed amounts; the server is the source of truth for every amount.
- **Phones MUST be stored E.164** (`+61412345678`), parsed and validated with `libphonenumber-js` against the business `phone_country`, and displayed in national format via `formatPhone`.
- **MUST NOT**, anywhere outside the module: call `toLocaleDateString` / `toLocaleTimeString` / `toLocaleString` / raw `Intl.*`; hand-roll a phone regex; import `date-fns`, `@date-fns/tz` or `libphonenumber-js` directly; add a second date, money or phone library (06-architecture.md, one tool per role).
- The confinement **MUST** be grep-able: `git grep -nE "toLocale(Date|Time)?String|Intl\." -- apps packages ':!packages/utils'` and `git grep -nE "from ['\"](date-fns|@date-fns/tz|libphonenumber-js)" -- apps packages ':!packages/utils'` return empty (paths per profile).
- React Native **MUST** consume the same package; where the bundler cannot, a mirror with identical function names is allowed and the profile names it.

## 11.5 Every data view implements all four UI states

- Every page or section that shows data **MUST** handle **loading, empty, error, success** - no blank screens, no unhandled empty arrays, no spinner-only pages.

| State | Implementation |
| --- | --- |
| Loading | route-level `loading.tsx` (Next.js) or a screen-level skeleton (React Native), built from the shared skeleton primitives and mirroring the final layout |
| Empty | `<EmptyState>` - icon, one-line explanation, and a CTA where an action exists ("No items yet - add your first item") |
| Error | route-level `error.tsx` plus `<ErrorState>` - human message and a retry action; never a stack trace or a raw API error (01-code-quality.md) |
| Success | the content itself, with explicit feedback for every mutation - toast or confirmation, and a pending or disabled state on the trigger (09-ui-ux-design.md) |

- A PR adding or changing a data view **MUST** show or reference all four states: screenshots, a preview route, or the test that renders each.
- Skeletons **MUST** mirror the final layout's shape and dimensions so the page does not jump when data lands.
- An offline-first mobile view **SHOULD** add a visible stale or syncing indicator on top of the four; it replaces none of them.

## 11.6 Enforcement

- The PR template **MUST** carry these checklist items (`../templates/pull_request_template.md`): components reused or promoted correctly · usage headers on exports · business-timezone display · shared formatters only · all four UI states · route stays static (`../stacks/nextjs.md`).
- The verification phase of every plan **MUST** audit them: the two greps in 11.4; `git grep -n "components/ui" -- apps` empty outside the shared package; `git grep -nE "<img[ >]" -- apps` empty where `next/image` fits; a usage-header spot-check of exports (`git grep -L "@example" -- 'packages/utils/src/*.ts'` lists offenders); the `next build` route table read for accidental dynamic routes; a state walkthrough per data view.
- **MUST NOT** weaken or scope down one of these greps to pass it; narrow it deliberately with a reason in the PR (10-workflow-and-verification.md §10.6).
- The repo-specific instantiation - package name, the composites that exist, the business settings columns - **MUST** be written in that repo's `plans/standards.md` and referenced from `AGENTS.md` §1.3 (`../templates/AGENTS.md`).

## Sources

- private/git-repo/claredesk/booking/plans/standards.md (user-mandated 2026-08-01; the primary source)
- private/git-repo/claredesk/booking/AGENTS.md
- private/git-repo/claredesk/booking/.github/pull_request_template.md
- private/git-repo/claredesk/booking/docs/allowed-apis.md (date-fns, libphonenumber-js, shadcn, Next.js sections)
- private/git-repo/claredesk/booking/docs/adr/0007-date-time-handling.md
- private/git-repo/claredesk/booking/docs/tech-stack-recommendation.md
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/AGENTS.md
- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/05-documentation.md
- development-team/git-repo/s22-internal-projects/tournament/dropin-tournament-app/CLAUDE.md
- development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md

Consolidated 2026-11-08
