# Pluto Web

Frontend for the **Pluto** application: React + TypeScript + Vite with shadcn/ui-style components and a full-featured app stack.

## Tech stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 7** — build tool and dev server
- **TanStack Router** — file-based routing with code splitting
- **TanStack React Query** — server state and caching
- **Redux Toolkit** — client state (accounts, transactions, categories)
- **Tailwind CSS 4** — styling
- **Radix UI / Base UI** — accessible primitives (shadcn-style)
- **i18next** — internationalization
- **Zod** — validation (forms and API)
- **PWA** — offline support via Vite PWA (Workbox)

## Prerequisites

- **Node.js** 18+
- **pnpm** 10.x (see `packageManager` in `package.json`)

## Setup

```bash
pnpm install
```

## Scripts

| Command             | Description                                                                      |
| ------------------- | -------------------------------------------------------------------------------- |
| `pnpm dev`          | Start dev server (Vite)                                                          |
| `pnpm build`        | Type-check and production build                                                  |
| `pnpm preview`      | Serve production build locally                                                   |
| `pnpm lint`         | Run ESLint                                                                       |
| `pnpm format`       | Format code with Prettier                                                        |
| `pnpm generate:api` | Generate API types from OpenAPI (API must be running at `http://localhost:3000`) |
| `pnpm patch`        | Bump patch version                                                               |

## Project structure

- `src/routes/` — TanStack Router file-based routes
- `src/features/` — feature modules (e.g. account, home)
- `src/components/` — shared UI components
- `src/store/` — Redux slices and async thunks
- `src/lib/` — API client, i18n, icons, utilities
- `src/lib/api/types.ts` — generated OpenAPI types (run `generate:api` when API schema changes)

## Environment

The app expects the backend API to be available. Configure the API base URL as needed (e.g. via env or app config). The OpenAPI schema is fetched from `http://localhost:3000/api-docs-json` when running `pnpm generate:api`.

## Version

Current version is defined in `package.json` (`version`). Build injects `__APP_VERSION__` and `__BUILD_DATE__` (see `vite.config.ts`).
