# 06 - Architecture

Good architecture keeps change cheap. Optimize for clear boundaries and low coupling.
Applies to: every repository. §6.7 applies when the project has a database; §6.8 when it is a
monorepo. The tenant column name and performance budget are set in ../projects/<profile>.md.

## 6.1 Core principles

- **MUST** apply separation of concerns - UI, business logic, and data access live in
  distinct layers/modules.
- **MUST** depend on abstractions at boundaries, not concrete implementations, where it
  reduces coupling (Dependency Inversion).
- **SHOULD** keep modules cohesive (one reason to change) and loosely coupled (few
  reasons to touch neighbors).
- **SHOULD** follow SOLID as guidance, not dogma.

## 6.2 Dependencies and boundaries

- **MUST NOT** let lower layers depend on higher layers (data layer must not import the
  UI).
- **MUST NOT** create circular dependencies between modules.
- **MUST** keep third-party libraries behind a thin adapter when they cross a core
  boundary, so they can be swapped.
- **MUST** keep the shared logic package (`@repo/shared` or equivalent: domain rules, zod
  schemas, permissions, pure helpers) free of React, Next.js, Expo and database-client imports so
  every app and the API can consume it.
- **MUST** put external services behind a port with one adapter each (payment gateway, SMS,
  error tracker, card terminal, token verifier); a second adapter replaces the first with no
  change to domain logic.
- **MUST NOT** let the request-handling layer (controllers, route handlers, server actions)
  touch the ORM or schema directly; it calls a service, and the service owns data access.

## 6.3 State and data flow

- **SHOULD** prefer explicit, one-directional data flow over hidden global mutable
  state.
- **MUST** make the source of truth for any piece of state singular and obvious.
- **SHOULD** keep functions pure where practical - same input, same output, no side
  effects.
- **MUST** implement each feature once and expose it through thin adapters (route handler,
  server action, CLI, widget, shortcode, block); parallel implementations drift apart.
- **MUST** keep client UI state (zustand or equivalent) separate from server state (TanStack
  Query or equivalent); never cache server data in a UI store.
- **MUST** keep the write path singular: either the database (RLS + RPC) or one API owns every
  write; clients never get a second write path.

## 6.4 Configuration

- **MUST** externalize configuration (env vars / config files), never hardcode
  environment-specific values.
- **MUST** keep the same build artifact deployable across environments - only config
  differs.
- **MUST** validate configuration at startup with a schema, and in a monorepo declare every env
  var the build reads in `turbo.json` (`globalEnv` / `env`). See
  ../stacks/monorepo-pnpm-turborepo.md.
- **MUST** keep `.env.example` complete: every key the code reads, no values
  (./04-security.md §4.1).

## 6.5 Performance and scalability

- **SHOULD** measure before optimizing. No premature optimization.
- **MUST** avoid obvious performance traps: N+1 queries, unbounded loops over external
  data, loading whole datasets into memory.
- **SHOULD** design for horizontal scaling (stateless services) where growth is
  expected.
- **MUST** keep correctness out of in-process state (sessions, caches, rate-limit counters,
  idempotency keys) wherever more than one replica can run; use the database or a shared store.
- **SHOULD** make optional features lazy: a feature that is switched off costs zero bytes on
  pages that do not use it.
- **SHOULD** set a performance budget in the project profile (e.g. Lighthouse mobile >= 90,
  LCP < 2.0 s, CLS < 0.05, a gzipped JS budget) and measure it in the UI quality gate
  (../stacks/responsive-adaptive-ux.md).

## 6.6 Changing architecture

- **MUST** write an ADR (see ./05-documentation.md §5.3) before adopting a new
  major pattern, framework, or datastore.
- **MUST NOT** introduce a new way of doing something that already has an established
  pattern in the codebase without agreement.
- **MUST** treat a committed stack and a committed design language as settled
  (./08-tech-stack.md): change them by ADR, never by re-evaluation inside a feature change.
- **MUST** write a new ADR or supersede one when a change alters an existing ADR's premise.

## 6.7 Data model defaults (when the project has a database)

- **MUST** give every tenant-owned table the tenant column (`organization_id` /
  `business_id` / `club_id` - the project profile names it) and Row Level Security; authorization
  is enforced in the database and re-checked on the server (./04-security.md §4.3).
  See ../stacks/supabase.md.
- **MUST** store money as integer minor units with CHECK constraints, never `text` or floats,
  and compute prices server-side only (./11-cross-cutting-standards.md).
- **MUST** use `timestamptz` everywhere and range types (`tstzrange`) for slots; never
  `time without time zone`.
- **MUST** model schedules, pricing, roles and permissions as relational tables, not JSONB
  blobs; permissions are normalized rows.
- **MUST** put invariants the database can enforce into the database (unique and exclusion
  constraints such as `EXCLUDE USING gist` against double-booking, FKs, CHECKs), not into
  application code alone.
- **MUST NOT** version business logic as copy-pasted SQL RPCs (`rpc_x_v9`); multi-step
  transactional logic lives in one reviewable service or one well-tested function.
- **MUST** keep hand-written SQL migrations as the single source of truth; an ORM schema mirrors
  them and never precedes or replaces one.

## 6.8 Monorepo layout defaults

- Layout: `apps/*` deployables (web, admin, backend, mobile); `packages/ui` (`@repo/ui`, the
  only home of shadcn components and colour tokens); `packages/shared` or `packages/utils` (pure
  logic and the single formatting package); `packages/db` or `packages/supabase` (generated
  types and clients); `packages/eslint-config`, `packages/typescript-config`.
  See ../stacks/monorepo-pnpm-turborepo.md.
- **MUST NOT** create a `components/ui` folder inside an app when the shared UI package exists;
  shadcn components are added into the shared package.
- **MUST** promote anything used by two apps into a package (the component placement ladder,
  ./11-cross-cutting-standards.md).
- **MUST** reference shared dependency versions through the pnpm `catalog:` so apps cannot drift
  apart (./04-security.md §4.4).

## Sources

- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/06-architecture.md (baseline; byte-identical in 8 of 9 repos)
- private/git-repo/claredesk/booking/docs/tech-stack-recommendation.md (ports and adapters, controller → service → data, single write owner, schema conventions A1-A10, SQL-first migrations)
- private/git-repo/claredesk/booking/AGENTS.md (§1.4 ADR supersession, §2 repository map)
- private/git-repo/claredesk/trionex/AGENTS.md and development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md (shared package import ban, RLS + tenant column, `@repo/*` layout)
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/AGENTS.md (shared UI package, `catalog:`)
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/00-non-negotiables.md (items 7-8: one render function per feature, zero-cost switched-off features, performance budget)
- Consolidated 2026-11-08
