# Giyani Workflow Demo

Concept demo built by **AccellionX** for a workflow-driven healthcare SaaS frontend. All data is mock. No real patient information.

This app shows how the UI can be built before a backend exists: every screen reads from typed API contracts served by Mock Service Worker (MSW).

## Stack

- React 18 + TypeScript (strict)
- Vite
- React Router v6
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- MSW (runs in development **and** production builds)
- Vitest + React Testing Library

## Quick start

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview the production build |
| `npm test` | Run Vitest |
| `npm run lint` | ESLint |

## Deploy to Vercel

Zero-config Vite deploy:

1. Import the repo in Vercel
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

MSW’s service worker is copied to `public/mockServiceWorker.js` and started from `src/main.tsx` in every environment, so the production demo keeps working without a backend.

## Project structure

```
src/
  api/           # contracts.ts, client.ts, feature hooks
  mocks/         # MSW handlers + seed data
  components/ui/ # reusable primitives
  features/      # dashboard, patients, intake, review, audit, about
  auth/          # role context, permissions map, RequireRole
  routes/        # app routes
```

## Roles

Use the role switcher in the top bar:

- **Admin** — KPIs, audit log, full review actions
- **Front Desk** — schedule / intake queue, create intake, review read-only
- **Clinician** — today’s patients, review approve/return

Permissions live in one map: `src/auth/permissions.ts`. Routes and actions use `<RequireRole>` instead of scattered conditionals.

## Demo tips

- Footer toggle **Simulate API error** forces MSW to return 500s so loading/error UI can be shown.
- Intake eligibility: member IDs ending in `R` → needs review; ending in `X` → not eligible; otherwise eligible.
- Intake drafts persist in `localStorage` if you leave and return.
- Audit log records eligibility checks, intake submits, and review actions for the session.

## Swapping mocks for a real API

1. Keep using the types in `src/api/contracts.ts`.
2. Point the client at your backend:

```bash
# .env
VITE_API_BASE_URL=https://api.example.com
```

`src/api/client.ts` already reads `VITE_API_BASE_URL` (default `/api`).

3. Disable MSW when talking to a real API — for example, gate the worker start in `src/main.tsx`:

```ts
if (import.meta.env.VITE_ENABLE_MSW === 'true') {
  await enableMocking()
}
```

No screen code needs to change if the real API honors the same contracts.

## Tests

```bash
npm test
```

Covers:

1. Intake patient-details step validation (Zod)
2. `RequireRole` redirect behavior
3. Review queue approve action
