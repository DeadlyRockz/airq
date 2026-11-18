# 04 - Security

Security is not a feature you add later. Treat every input as hostile and every secret
as radioactive.
Applies to: every repository and every agent session on this machine, including what the agent
prints in chat, logs, plans, docs and commit messages.

## 4.1 Secrets and credentials

- **MUST NOT** hardcode secrets, API keys, passwords, or tokens in source code.
- **MUST** load secrets from environment variables or a secrets manager.
- **MUST** provide a `.env.example` with keys but **no real values**.
- **MUST** add `.env*` (except `.env.example`) to `.gitignore`.
- **MUST** rotate any credential that is ever committed, even after removing it - the remote's
  history still has it.
- **MUST NOT** ship a service-role / secret key (a Supabase `service_role` or `sb_secret_*` key,
  a Stripe `sk_*` key, an SMTP password) into any browser or mobile bundle. Only
  publishable/anon keys may be `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*`. Verify against the **built
  output** (grep the `.next/` or export directory), not just the source.
- **MUST** confine service-role usage to the places the project's security plan lists
  (server-only modules, Edge Functions, migrations, seeds). See ../stacks/supabase.md.
- An agent **MUST NOT** print, quote, copy or summarise the values inside any `.env*`,
  `.mcp.json`, keystore or credential file into chat, logs, documentation, plans or commit
  messages. File names and key names may be mentioned; values never.

## 4.2 Input handling

- **MUST** validate and sanitize all external input (user, API, file, env) at the
  boundary.
- **MUST** use parameterized queries / prepared statements - never build SQL by string
  concatenation.
- **MUST** encode output for its context (HTML, URL, shell) to prevent injection/XSS.
- **MUST NOT** trust client-side validation alone; always re-validate on the server.
- **MUST** satisfy four separate obligations on every state-changing code path: validate and
  sanitize the input, encode the output, prove request authenticity (CSRF token / nonce /
  same-origin check), and authorize the caller. None substitutes for another.
- **MUST** validate the environment at startup with a schema (zod, `@nestjs/config`, Pydantic)
  so a missing or malformed variable fails the boot, not a request.

## 4.3 Authentication and authorization

- **MUST** check authorization on every protected operation on the server, not just hide
  UI.
- **MUST** apply least privilege - grant the minimum access needed.
- **MUST NOT** roll your own crypto or auth. Use vetted, maintained libraries.
- **MUST** store passwords only as salted hashes from a strong KDF (bcrypt, argon2,
  scrypt).
- **MUST** enforce authorization at the data layer (RLS policies / RPCs scoped by the tenant
  column `organization_id` / `business_id` / `club_id`) **and** re-check it on the server
  (guards, server actions). Hiding UI is cosmetic. JWT claims are for routing only, never the
  sole authorization input.
- **MUST** use the platform's auth (Supabase Auth, Auth.js, Clerk) and its native providers for
  OTP / SMS / email; **MUST NOT** roll a bespoke integration into the auth path.
- **MUST** verify tokens on the server against the issuer's JWKS (asymmetric keys) before
  trusting a session; a session cookie alone is not proof.
- **MUST NOT** store PINs, passwords or secrets in ordinary columns; a staff or user table never
  carries `password`, `pin` or `admin_pin`.

## 4.4 Dependencies

- **MUST** pin dependency versions (lockfile committed).
- **MUST** review and run a vulnerability scan (`npm audit`, `pip-audit`, Dependabot)
  before adding or upgrading dependencies.
- **SHOULD** prefer well-maintained libraries over abandoned ones; avoid pulling a
  dependency for something trivial.
- **MUST NOT** disable security features (TLS verification, CORS, CSP) to "make it work".
- **MUST** pin exact versions (no `^` / `~`) in monorepos through the pnpm `catalog:`; install
  with `--frozen-lockfile` in CI. See ../stacks/monorepo-pnpm-turborepo.md.
- **MUST** run `pnpm audit --prod --audit-level=critical` (or the ecosystem equivalent) in CI
  (../stacks/ci-github-actions.md).
- **MUST** list every new dependency in the project's allowed-APIs document in the same PR, with
  its justification and "Never" cases (./10-workflow-and-verification.md).

## 4.5 Data protection

- **MUST** use HTTPS/TLS for data in transit.
- **MUST NOT** log secrets, tokens, full card numbers, or personal data.
- **SHOULD** collect and retain the minimum personal data necessary.
- **MUST NOT** let a token, OTP code, session cookie or PII reach logs or error tracking; scrub
  structured records before emitting them.
- **MUST** map database and driver errors to client-safe problem details; raw SQLSTATE text or
  stack traces never leave the server.
- **SHOULD** record the data-protection jurisdiction (e.g. Australian Privacy Act / APPs, India
  DPDP Act 2023) in the project profile and design deletion / anonymisation to it.

## 4.6 Reporting

- **MUST** treat any discovered vulnerability as high priority and disclose it privately
  to maintainers, not in a public issue.
- **MUST** record a leaked credential (what, where, rotated on which date) in the project
  profile so a later session does not re-discover it.

## 4.7 Secrets on this machine

Real credential files for every project live in `~/Prahadeesh/secrets`, mirrored by path, and
are symlinked into the project where the `.env` used to be. Layout, path mapping and the `proj`
CLI are documented in ../machine/workspace.md; this section only states the obligations.

- **MUST** move a new project's real `.env` / `.env.local` / token-bearing `.mcp.json` into the
  secrets store at the mirrored path and run `proj relink`; the repo keeps only the symlink.
- **MUST** run `git -C <repo> check-ignore -v .env` (and the same for every env file) before the
  first commit; it MUST print a match. A `.gitignore` that lists only `.env*.local` has leaked a
  plain `.env` before - cover `.env*` and allow-list `.env.example`.
- **MUST** keep `.env.example` / `.env.sample` in git, never in the secrets store; they are
  templates.
- **MUST** decide per file whether a `.mcp.json` is secret:
  `grep -E 'sbp_|sk-|ghp_|_TOKEN|_KEY|PASSWORD' <file>`. A match means it belongs in the secrets
  store; no match means it may stay tracked.
- **MUST** run `proj relink <path>` after cloning or restoring a project; re-cloning never
  restores credentials, because they were never pushed.
- An agent **MUST NOT** read a secrets-store file into its context except by key name
  (`grep -oE '^[A-Z0-9_]+=' .env`) when the task needs to know which keys exist.
- **MUST** rotate anything ever committed to a remote (§4.1) and note the rotation (§4.6).

## Sources

- development-team/git-repo/Solution22-AUS/DropinPOS/engineering-rules/04-security.md (baseline; byte-identical in 8 of 9 repos)
- private/git-repo/claredesk/booking/AGENTS.md (§5: service-role key never in a browser bundle, verified against built output)
- private/git-repo/claredesk/booking/.github/pull_request_template.md (security checklist: server-side validation, no PII in logs)
- private/git-repo/claredesk/booking/docs/tech-stack-recommendation.md (§5 auth: JWKS verification, normalized permissions, no `pin`/`password` columns; scrubbed logs)
- private/git-repo/claredesk/trionex/AGENTS.md and development-team/git-repo/s22-internal-projects/tournament/s22-tournament/AGENTS.md (RLS + tenant column, JWT claims only for routing, service-role confinement)
- private/git-repo/claredesk/wordpress/claredesk/engineering-rules/00-non-negotiables.md (item 4: escape / sanitize / nonce / capability-check)
- development-team/git-repo/Solution22-AUS/DropinPOS/DropinPOS/.github/workflows/ci.yml (`pnpm audit --prod --audit-level=critical`)
- secrets/README.md (secrets store, `proj relink`, `check-ignore`, `.mcp.json` grep, rotation warning)
- Consolidated 2026-11-08
