# Goals app for achieving a goal in a year

Client-only React + TypeScript app to track yearly goals on a day-by-day calendar. Uses Dexie (IndexedDB) for persistence, Tailwind for styles, and Zustand for state.

Quick start

```bash
npm install
npm run dev
```

Dev notes

- App entry: `src/main.tsx`
- Components: `src/components/*`
- Store: `src/state/store.ts` (Zustand, loads/saves via `src/db/database.ts`)
- Types: `src/types.ts`
