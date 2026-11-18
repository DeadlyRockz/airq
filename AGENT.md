# AirQ - Challenge 6: Urban Air Quality Assistant

This repository is a hackathon submission for **Challenge 6**. Build a real GenAI-powered, location- and lifestyle-aware assistant that gives safe daily routine changes, indoor air quality advice, sustainable alternatives, and transparent explanations of likely impact.

## Always-on priorities

1. **Problem alignment (HIGH):** Context -> reliable AQI data -> deterministic safety-aware decision -> personalized action -> grounded GenAI explanation -> visible impact and trade-off. An AQI dashboard alone is insufficient.
2. **Code quality (HIGH):** Strict TypeScript, small modules, Zod validation, pure testable policy functions, no speculative features before the user journey works.
3. **Security and efficiency (MEDIUM):** Never expose secrets, treat API/model content as untrusted, restrict server requests, cache external data, keep bundle small.
4. **Testing and accessibility (LOW but required):** Test edge cases, keyboard and mobile support, visible loading/error/demo states, readable risk labels.

## Mandatory behavioral rules

- Work on the existing workspace; inspect files and Git state before modifying.
- Use **Next.js App Router, TypeScript, Tailwind, Zod, Vitest**, and optional server-side AI; no login/DB necessary for MVP.
- Always build a functioning **no-key demo** that openly labels sample data and proves personalized, variable recommendations.
- Distinguish **US AQI** from **India/CPCB AQI**, use only matching category thresholds, and show source, unit, timestamp, forecast/observation and uncertainty. Open-Meteo's `us_aqi` is not CPCB AQI.
- Never invent quantitative health improvement, pollution reduction, or CO2 savings. Show documented assumptions for any numeric estimate. Prioritize exposure safety over low-carbon outdoor travel during high smog.
- Do not advise sealing homes at the expense of fuel-burning/CO ventilation; indoor conditions cannot be known without sensors.
- Avoid medical diagnosis and clinical promises. Provide sensible official guidance for severe risk.
- No API key in client code or repository; use `.env.example` only. No fabricated completion/QA/deployment claims.
- Deliver README with challenge vertical, architecture/logic, assumptions, setup, sources, limits, tests, demo steps.

## Submission contract

- Window: **16 Nov 2026 16:00 IST–29 Nov 2026 23:59 IST**.
- **At most 3 submissions**. Never submit without explicit permission.
- **Public GitHub repository**, **less than 10 MB**, **one branch**, complete source.
- No `node_modules`, `.next`, `.env`, `dist`, coverage, downloaded models, or heavy binaries in Git.
- Video must actually exist and be accessible via unlisted YouTube or permission-enabled Drive link.
- Verify tests/build, one branch, repo size, public accessibility, and docs before marking ready; request approval for external pushes or submissions.

## Working approach

Deliver in this order: inspect -> short plan -> typed AQI/source model and safety policy -> deterministic fixtures/demo -> live data with attribution and fallback -> optional grounded GenAI -> polished accessible UI -> tests -> documentation -> compliance check.

For a specialized project-building agent, use `.agents/agents/urban-air-quality-builder/agent.md` (select it through `/agents` in Antigravity CLI). The specialized file contains the detailed feature spec and acceptance tests.
