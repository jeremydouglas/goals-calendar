# Copilot / Agent Instructions — Calendar Goals App

Purpose
- Single-page React + TypeScript app (Vite) to track yearly goals on a day-by-day calendar. Client-only persistence using Dexie (IndexedDB). No auth, data export/import via JSON backups.

Big picture
- Architecture: UI components (`src/components/*`) render a single-year table (`CalendarGrid`) and goal controls (`GoalPanel`). State is held in a React Context (`src/state/GoalsContext.tsx`) and mirrored to Dexie (`src/db/database.ts`).
- Data flow: Component -> Context (actions) -> Reducer -> Dexie persistence. On load, the Context hydrates from Dexie; on writes, the Context updates state and writes changes to Dexie.

Key files to read/use (created by the scaffold)
- `src/main.tsx`, `src/App.tsx` — app entry and router (if any).
- `src/components/CalendarGrid.tsx` — renders all days of the year in one big table; cells show whether a day contributed to one or more goals.
- `src/components/GoalPanel.tsx` — create/edit goals, set quarterly statuses, show percent complete.
- `src/state/GoalsContext.tsx` — React Context + reducer that exposes `state` and `dispatch` helpers.
- `src/db/database.ts` — Dexie DB schema: tables `goals` and `dayEntries`.
- `src/utils/progress.ts` — functions: `quarterProgress(goal, year, quarter)` and `yearProgress(goal, year)`.
- `src/utils/backup.ts` — export/import helpers producing and consuming a JSON backup with `{ version, goals[], dayEntries[], createdAt }`.

Conventions and patterns
- TypeScript-first: put shared types in `src/types.ts` and import them across components and DB schema.
- Component layout: place presentational components under `src/components` and hooks/logic under `src/hooks` or `src/state`.
- State persistence: always apply state changes through the Context reducer. Side-effects that write to Dexie should be implemented as small async helpers (in `src/db`) invoked from an effect (not directly inside reducers).
- Date handling: use ISO date keys (YYYY-MM-DD) for day identity (e.g., `2026-01-18`) to avoid timezone bugs. Store entries keyed by ISO date strings in `dayEntries`.

Persistence details
- Use `Dexie` (recommended schema):
  - `goals` table: `{ id: string, title: string, year: number, metadata?: object }`
  - `dayEntries` table: `{ id?: number, goalId: string, dateIso: string, contributed: boolean }`
- Backup: export arrays for `goals` and `dayEntries` plus `appVersion` and `createdAt`. Import should validate `appVersion` and attempt simple migrations (or fail with a clear error).

Progress calculations
- Quarter percent = (days contributed within quarter) / (days in quarter) * 100.
- Year percent = (days contributed in year) / (365 or 366) * 100.
- Implement these in `src/utils/progress.ts` and use them for UI badges and `GoalPanel` summaries.

Developer workflows (after scaffold)
- Dev server (Vite): `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Tests (Vitest): `npm run test`

Agent-specific rules
- Prefer small, focused changes. Use `apply_patch` for edits and keep commits logically scoped.
- When adding a new file, include a brief unit test and export the symbol for easier reuse.
- Avoid touching global formatting; match existing style (Prettier/TSLint) if present.
- For persistence changes, update `src/db/database.ts` and add a migration strategy in `src/db/migrations.ts`.

Examples (how to interact programmatically)
- Mark a day as contributed:
  - `await db.dayEntries.put({ goalId, dateIso: '2026-01-18', contributed: true })`
- Calculate quarter progress:
  - `const pct = quarterProgress(goalId, 2026, 1)` (returns number 0-100)

When unsure / questions for the repo owner
- Confirm styling approach (plain CSS modules vs Tailwind) and whether mobile/tablet responsiveness is required.
- Confirm preferred state pattern if you want a store (Zustand) instead of Context.

If any section is unclear or you want the agent to scaffold the initial project files now, tell me which areas to prioritize (scaffold, DB, UI), and I'll proceed.
