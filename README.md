# Pluto Web

[![CI](https://github.com/Bababum95/pluto-web/actions/workflows/ci.yml/badge.svg)](https://github.com/Bababum95/pluto-web/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/Bababum95/pluto-web/graph/badge.svg?token=6R7TQV26AM)](https://codecov.io/gh/Bababum95/pluto-web) [![Storybook](https://img.shields.io/badge/Storybook-Live-ff528c?style=flat)](https://pluto-storybook.vercel.app/)

Frontend for the **Pluto** application: React + TypeScript + Vite with shadcn/ui-style components and a full-featured app stack.

## Tech stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 7** — build tool and dev server
- **TanStack Router** — file-based routing with code splitting
- **TanStack React Query** — server state and caching
- **TanStack Form** — form state and validation
- **Redux Toolkit** — client state (accounts, transactions, categories, settings)
- **Tailwind CSS 4** — styling
- **Radix UI / Base UI / Shadcn UI** — accessible primitives (shadcn-style)
- **i18next** — internationalization
- **Zod** — validation (forms and API)
- **Motion** — animations
- **Vitest** — unit and integration tests
- **Storybook** — component development and documentation
- **PWA** — offline support via Vite PWA (Workbox)

## Prerequisites

- **Node.js** 18+
- **pnpm** 10.x (see `packageManager` in `package.json`)

## Setup

```bash
pnpm install
```

## Scripts

| Command                | Description                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm dev`             | Start dev server (Vite)                                                                                    |
| `pnpm build`           | Type-check and production build                                                                            |
| `pnpm preview`         | Serve production build locally                                                                             |
| `pnpm lint`            | Run ESLint                                                                                                 |
| `pnpm test`            | Run tests (Vitest)                                                                                         |
| `pnpm test:watch`      | Run tests in watch mode                                                                                    |
| `pnpm test:coverage`   | Run tests with coverage report                                                                             |
| `pnpm storybook`       | Start Storybook dev server (port 6006)                                                                     |
| `pnpm build-storybook` | Build Storybook for static export                                                                          |
| `pnpm generate:api`    | Generate API client/types with Orval (`ORVAL_INPUT_TARGET` or local `http://localhost:3000/api-docs-json`) |
| `pnpm icons:generate`  | Generate icon components from SVG registry                                                                 |
| `pnpm patch`           | Bump patch version                                                                                         |

## Project structure

- `src/routes/` — TanStack Router file-based routes (thin → `pages/`)
- `src/pages/` — route-level screens
- `src/widgets/` — composite sections (e.g. `app-shell`, lists, header)
- `src/features/` — user flows by domain (often `create/`, `update/`, …)
- `src/entities/` — Redux domains, selectors, local-first repositories
- `src/app/` — providers, Redux store wiring, app-level slices
- `src/shared/` — design-system UI, config, money/date/i18n helpers, API plumbing
- `src/components/` — legacy/misc not yet migrated (e.g. devtools, loaders)
- `src/lib/` — shims and paths still pointing at shared/local (see `docs/FSD_ARCHITECTURE.md`)
- `src/lib/api/generated/` — generated Orval client, hooks, and models
- `scripts/` — build scripts (e.g. icon component generation)

Layer rules and verification commands: **`docs/FSD_ARCHITECTURE.md`** (repo root).

## Environment

The app expects the backend API to be available. Configure the API base URL as needed (e.g. via env or app config).  
For codegen, set `ORVAL_INPUT_TARGET` (used in CI) or run local API at `http://localhost:3000/api-docs-json`.

## Version

Current version is defined in `package.json` (`version`). Build injects `__APP_VERSION__` and `__BUILD_DATE__` (see `vite.config.ts`).
