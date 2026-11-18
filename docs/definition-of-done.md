# Definition of Done - AirQ

A change is complete when every item below holds:

- [ ] `pnpm format:check` passes with zero style warnings.
- [ ] `pnpm lint` (`eslint . --max-warnings 0`) passes with zero warnings.
- [ ] `pnpm typecheck` (`tsc --noEmit`) passes under `strict: true`.
- [ ] `pnpm test` (`vitest run`) passes with all tests green.
- [ ] `pnpm build` (`next build`) succeeds cleanly.
- [ ] Zero secrets, `.env*` files (other than `.env.example`), or `NEXT_PUBLIC_*` keys in code or Git.
- [ ] US EPA AQI and India/CPCB AQI scales remain strictly separated.
- [ ] Safety guards (exposure safety first, indoor fuel/CO ventilation, no-sensor notice, non-diagnostic disclaimer) remain intact.
