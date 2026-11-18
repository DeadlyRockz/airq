# 08 - Tech Stack

The tech stack is selected dynamically based on project goals, performance requirements,
developer speed, and scale. AI agents must analyze requirements and suggest a tailored tech
stack at build time rather than enforcing a static set of tools - and get it approved first.
Applies to: every new project, service, or major module. **Two things are not dynamic.** A
**design language** the project has committed to (its token layer and design system -
./09-ui-ux-design.md, ../stacks/design-tokens-and-theming.md) is fixed: whatever framework is
chosen must consume its tokens. And where a stack is **already committed in the repository**
(lockfile, `packageManager`, framework config), it is settled: changing it needs an ADR
(./06-architecture.md §6.6), not a fresh evaluation.

## 8.1 Build-time evaluation protocol

Before initiating code generation for a new project, service, or major module, the AI agent
**MUST**:

1. **Analyze requirements**: evaluate project objectives, user traffic expectations, real-time
   needs, SEO constraints, data complexity, how many clients the API serves, transactional
   needs, and security bounds. Write them down before naming a technology.
2. **Formulate a Tech Stack Recommendation** covering exactly six items:
   - **Frontend framework** (e.g. Next.js, Vite + React, Vue/Nuxt, SvelteKit, Expo / React
     Native, a Tauri shell, or vanilla HTML/JS)
   - **Styling & design system**: the **delivery mechanism** is open (Tailwind + shadcn, CSS
     Modules, StyleSheet, a native styling runtime); the **design language is not** when one is
     committed - state how the chosen mechanism carries its tokens
   - **Backend & API layer** (e.g. Next.js Route Handlers / Server Actions, NestJS,
     Fastify/Express, Python FastAPI, Go, Rust, Supabase Edge Functions)
   - **Database & data layer** (e.g. PostgreSQL + Drizzle/Prisma, Supabase, MongoDB, Redis,
     pgvector)
   - **Authentication & authorization** (e.g. Supabase Auth, Auth.js / NextAuth, Clerk, Auth0)
   - **Rationale**: why this combination is optimal for the specific use case, including the
     costs accepted. Payments, hosting, observability and messaging providers are stated inside
     the relevant item, never as a seventh item.
3. **Present to user**: present the proposed stack in the implementation plan or initial response
   for user feedback or approval **before writing code**, then record the approval (date, where)
   in the recommendation document (§8.5).

## 8.2 Common stack patterns by project archetype

| Archetype                          | Recommended stack                                                                               | Key rationale                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Full-stack SaaS / SEO**          | Next.js (App Router), Tailwind CSS, PostgreSQL (Supabase, SQL-first + Drizzle), Supabase Auth   | Fast SSR/SSG, rich component ecosystem, quick time-to-market.  |
| **Interactive dashboard / SPA**    | React (Vite) / Vue, Tailwind / CSS Modules, FastAPI or Node.js (NestJS/Fastify), PostgreSQL      | High interactivity, client-heavy state, decoupled backend API. |
| **One API, 3+ clients**            | NestJS modular monolith (REST + OpenAPI, owns every write), Supabase Postgres, generated clients | One contract for web, admin and mobile; transactions in code.  |
| **High-performance microservices** | Go (Gin/Fiber) or Rust (Axum), PostgreSQL / Redis, gRPC / REST                                  | Low memory footprint, high concurrency, fast startup time.     |
| **AI / ML & data analytics**       | Python (FastAPI / Streamlit), LangChain / LlamaIndex, pgvector / Qdrant, React/Vite             | Native Python ML ecosystem, fast vector processing.            |
| **Mobile & cross-platform**        | React Native (Expo Router, SDK-pinned), Supabase backend, EAS builds                            | Unified cross-platform codebase, built-in BaaS sync.           |
| **Desktop shell**                  | Tauri 2 over the existing web app                                                               | Small binary, reuses the web UI - ../stacks/tauri-desktop.md   |
| **WordPress / WooCommerce**        | PHP theme + companion plugin, Elementor/Gutenberg adapters                                      | Marketplace rules apply - ../stacks/wordpress-woocommerce.md   |

## 8.3 Quality & stack standards

Once a stack is approved:

- **MUST** follow strict type safety (TypeScript, Pydantic, static types).
- **MUST** validate external inputs at system boundaries (e.g. Zod, Pydantic).
- **MUST** keep environment configuration externalized (`.env`).
- **MUST** enforce security best practices (no committed secrets, proper authorization checks).
- **MUST** stand up the token layer before any component work, and consume tokens only - no
  hardcoded colors, sizes, radii, or shadows (./09-ui-ux-design.md,
  ../stacks/design-tokens-and-theming.md).
- **MUST** pin the framework's own version contract and honor it: for Expo that means
  `npx expo install` and the SDK's package set; for Next.js one release's `next` / `react` /
  `react-dom` triple; for shadcn the unified `radix-ui` package its CLI installs.
- **MUST** write an ADR for each framework, database or major pattern introduced
  (./05-documentation.md §5.3) and list every library in the allowed-APIs document with its
  Use/Never surface (./10-workflow-and-verification.md, ../templates/allowed-apis-template.md).
- **MUST** install with the pinned package manager only (`packageManager` field - pnpm in every
  current repo); never npm or yarn in a pnpm repo.

## 8.4 Observed default stack (starting recommendation, still presented for approval)

Derived from what this user actually ships (versions resolved from the repos on 2026-11-08). Use
it as the first draft of §8.1 step 2 and depart from it only with a written reason in the
Rationale. It never skips step 3.

| Layer                | Default                                                                                                    | Notes                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Web frontend         | Next.js 16 App Router + React 19 + TypeScript                                                              | Server Components by default, `proxy.ts` (not `middleware.ts`), static-first routes - ../stacks/nextjs.md |
| Styling              | Tailwind CSS v4 (CSS-first, no `tailwind.config.js`) + shadcn/ui on the unified `radix-ui` package + `lucide-react` | Components only in the shared UI package; tokens in `globals.css` - ../stacks/design-tokens-and-theming.md |
| Backend (default)    | Supabase: Postgres with RLS, Auth, Storage, Edge Functions                                                 | SQL-first migrations, generated types, drift check - ../stacks/supabase.md                                |
| Standalone API       | NestJS 11 modular monolith                                                                                 | Only when one API serves 3+ clients or needs transactions supabase-js cannot express - ../stacks/nestjs-backend.md |
| Mobile               | Expo (expo-router, EAS Build/Submit)                                                                       | SDK-pinned via `npx expo install` - ../stacks/expo-react-native.md                                        |
| Desktop              | Tauri 2 shell over the web app                                                                             | ../stacks/tauri-desktop.md                                                                                |
| Monorepo             | pnpm workspaces + Turborepo, exact pinned versions, `catalog:`                                             | `@repo/*` packages - ../stacks/monorepo-pnpm-turborepo.md                                                 |
| Forms & validation   | zod + react-hook-form (`@hookform/resolvers`)                                                              | One zod schema per form mirroring the server DTO field-for-field                                          |
| State & data         | zustand (client UI state) + TanStack Query (server state)                                                  | Never server state in zustand (./06-architecture.md §6.3)                                                 |
| Dates, money, phone  | date-fns + `@date-fns/tz`; integer minor units; `libphonenumber-js` (E.164)                                | Only inside the single shared formatting package - ./11-cross-cutting-standards.md                        |
| Charts               | recharts                                                                                                   |                                                                                                           |
| Tests                | Vitest (packages, Next apps), Jest (NestJS; Expo via `jest-expo`), Playwright (web e2e), pgTAP (RLS)      | ./03-testing.md §3.7                                                                                      |
| Lint & format        | ESLint 9+ flat config with `--max-warnings 0`; Prettier 3 (+ `prettier-plugin-tailwindcss`)                | ./01-code-quality.md §1.5                                                                                 |
| Runtime & tooling    | Node 22-24, pnpm 10-12 pinned via `packageManager`, TypeScript 5.9+                                         | Never npm or yarn in a pnpm repo                                                                          |
| Hosting              | Vercel for web; EAS for store builds; Supabase cloud for the backend                                       | Region and project refs live in the project profile                                                       |
| CI                   | GitHub Actions: setup reads `packageManager`; lint / typecheck / test / build; audit; drift jobs           | ../stacks/ci-github-actions.md, ../templates/ci.yml                                                       |

Alternatives stay available through §8.2: Vite + React for an SPA without SEO, FastAPI for
Python / ML services (../stacks/python-services.md), WordPress / WooCommerce for theme and plugin
work (../stacks/wordpress-woocommerce.md), Shopify embedded apps (../stacks/shopify-app.md).

## 8.5 The stack recommendation document

- **MUST** write the approved recommendation to `docs/tech-stack-recommendation.md` in the repo,
  headed "Tech Stack Recommendation (engineering rule 8.1)" with a **Status** line (Proposed, or
  Accepted + date + where it was approved).
- **MUST** open with an authority table: engineering rules → allowed-APIs document (binding
  Use/Never surface) → ADRs → `pnpm ls -r --depth 0` (the truth about versions) → this file (a
  navigable index; when it disagrees with any row above, the row above wins).
- **MUST** contain, in order: "Protocol step 1 - requirements analysed" (each constraint traceable
  to a plan, finding or ADR), then the six §8.1 items as numbered sections, each with a table of
  `Package | Resolved version | Where`.
- **MUST** resolve every version from `pnpm ls -r --depth 0` (or the ecosystem equivalent) run in
  this session, and state the date. Nothing is pinned from memory or from plan prose. A library
  chosen but not yet installed is marked `(planned)`.
- **SHOULD** add appendices: approval record (event / date / evidence); alternatives considered
  (an index into the ADRs, not a copy); risks and how each is exited; **as-built divergences**
  ("record the as-built choice; never retro-fit the plan"); and **what this document could not
  source**, stated plainly rather than filled with invented content.
- **MUST** update the document, or supersede it by ADR, when a stack item changes; it is part of
  "done" (./05-documentation.md §5.5).

## 8.6 Frameworks newer than training data

The versions in use on this machine (Next.js 16, React 19, Tailwind v4, Expo SDK 56+, shadcn on
`radix-ui`, ESLint 9+ flat config, pnpm 10+, Node 22+) differ from the releases an agent may
remember. Do not "correct" them downward.

- **MUST** read the installed framework's bundled or versioned docs before using any of its
  APIs: Next.js at `node_modules/next/dist/docs/` (resolved from the app directory - in a
  monorepo `next` may not be visible from the repo root); Expo at
  `https://docs.expo.dev/versions/v<major>/` for the SDK major in `package.json`; Tailwind v4's
  CSS-first config (`@theme`, `@source` in the stylesheet). Heed deprecation notices.
- **MUST** confirm the installed version first (`pnpm ls <pkg>`, the `package.json`) and write
  code for that version, not for the one in memory.
- **MUST NOT** downgrade a dependency, swap to an older API shape (`middleware.ts`, `pages/`,
  `getServerSideProps`, `tailwind.config.js`, per-package `@radix-ui/react-*` when the unified
  package is installed) or loosen strict mode to make a remembered pattern work.
- **MUST** add Expo packages with `npx expo install <pkg>`, never `pnpm add`, so versions match
  the SDK; **MUST** add shadcn components with the shadcn CLI into the shared UI package.
- **MUST** keep the framework-written agent-docs block (the Next.js `BEGIN:nextjs-agent-rules`
  block in AGENTS.md) committed; removing it only re-creates the change (../stacks/nextjs.md).

## Sources

- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/08-tech-stack.md (baseline; byte-identical in 8 of 9 repos)
- private/git-repo/claredesk/billing/claredesk-billing/apps/app/engineering-rules/08-tech-stack.md ("two things are not dynamic", token layer first, framework version contract, `npx expo install`)
- private/git-repo/claredesk/booking/docs/tech-stack-recommendation.md (document format, authority table, `pnpm ls` rule, `(planned)` marker, appendices)
- private/git-repo/claredesk/booking/AGENTS.md (§2 repository map and commands, Node / packageManager)
- private/git-repo/claredesk/trionex/AGENTS.md, development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md, development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/AGENTS.md (bundled Next.js docs rule, pnpm only, `catalog:`, shadcn into the shared package)
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/.github/workflows/ci.yml (CI shape, Node 24)
- Dependency survey of `package.json`, `.prettierrc`, `pnpm-workspace.yaml`, `vercel.json`, `eas.json` across development-team/ and private/ on 2026-11-08
- Consolidated 2026-11-08
