# Allowed APIs - AirQ

Closed list of approved packages and platform APIs for **AirQ** with versions resolved from `package.json` / `pnpm-lock.yaml`.

## Next.js `16.4.6` & React `19.3.1`
- **Use:** App Router (`src/app/`), Server Components by default, `"use client"` at interactive leaves, Route Handlers (`src/app/api/*/route.ts`), `next/font/google`, `next/link`.
- **Never:** `pages/` router, `getServerSideProps`, `middleware.ts`, raw `<img>` tags.

## Tailwind CSS `4.3.5` & shadcn/ui (`radix-ui` `1.8.1`, `lucide-react` `1.74.0`, `next-themes` `0.4.6`)
- **Use:** CSS-first `@theme inline` tokens in `src/app/globals.css`, shadcn components in `src/components/ui/`, `cn()` from `@/lib/utils`, `lucide-react` icons (`size-4`, `size-5`, `size-6`).
- **Never:** `tailwind.config.js`, hardcoded hex/palette colors, arbitrary bracket sizes, `uppercase` / `capitalize` CSS overrides, non-Lucide icons.

## Validation & Testing (`zod` `4.6.7`, `vitest` `5.1.0`, `@testing-library/react` `16.3.3`)
- **Use:** Strict Zod schemas at every API, upstream response, LLM output, and `sessionStorage` boundary; Vitest unit and component tests.
- **Never:** Unvalidated JSON parsing, `any` types, `@ts-ignore`, or skipped/weakened tests.

## External HTTP APIs (Server-Side Only)
- **Open-Meteo Geocoding & Air Quality API:** `https://geocoding-api.open-meteo.com/v1/search` and `https://air-quality-api.open-meteo.com/v1/air-quality` inside `src/lib/aqi/open-meteo.ts` (`import "server-only"`).
- **Google Gemini Developer API:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` inside `src/lib/ai/explain.ts` (`import "server-only"`), passing `GEMINI_API_KEY` via `x-goog-api-key` header only.
- **Never:** Direct external API calls or API keys in client components (`NEXT_PUBLIC_*`).
